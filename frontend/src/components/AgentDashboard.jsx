import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { createClient } from '@supabase/supabase-js';
import { BACKEND_URL } from "../config";
import CallCard from "./CallCard";
import { useNavigate } from "react-router-dom"; 
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database"; 
import { app } from "../config"; 

// Initialize Firebase Auth & DB
const auth = getAuth(app); 
const db = getDatabase(app);

// Initialize Supabase Client (MAIN DB)
const supabaseUrl = 'https://wbtslpyulsskgdtkknaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHNscHl1bHNza2dkdGtrbmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc0MDgsImV4cCI6MjA3OTIyMzQwOH0.BcvA4VFPybxQvQRNpt1e0NvDNATrhddx5RgvWAYgQM0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Employee Supabase Client
const empSupabaseUrl = process.env.REACT_APP_EMP_SUPABASE_URL || 'YOUR_EMP_SUPABASE_URL';
const empSupabaseAnonKey = process.env.REACT_APP_EMP_SUPABASE_ANON_KEY || 'YOUR_EMP_SUPABASE_ANON_KEY';
const empSupabase = createClient(empSupabaseUrl, empSupabaseAnonKey);

export default function AgentDashboard() {
  const navigate = useNavigate(); 

  const [status, setStatus] = useState("offline");
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [scheduledOrders, setScheduledOrders] = useState([]);
  const [appOrders, setAppOrders] = useState([]); // 🚀 NEW: App-placed orders
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [agentDbId, setAgentDbId] = useState(null); 

  // --- HELPER: Parse scheduled time string ---
  const parseScheduledTime = (timeString) => {
    try {
      const [datePart, timePart, meridiem] = timeString.split(' ');
      const [year, month, day] = datePart.split('-');
      let [hours, minutes] = timePart.split(':');
      
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      if (meridiem === 'PM' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
      console.error("Error parsing scheduled time:", timeString, error);
      return null;
    }
  };

  // --- HELPER: Check if order should be displayed (within 1 hour of scheduled time) ---
  const shouldDisplayOrder = (scheduledTimeString) => {
    const scheduledTime = parseScheduledTime(scheduledTimeString);
    if (!scheduledTime) return false;
    
    const now = new Date();
    const oneHourBefore = new Date(scheduledTime.getTime() - (60 * 60 * 1000));
    
    const shouldDisplay = now >= oneHourBefore;
    
    console.log(`⏰ Time check for order:`, {
      scheduledTime: scheduledTime.toLocaleString(),
      oneHourBefore: oneHourBefore.toLocaleString(),
      currentTime: now.toLocaleString(),
      shouldDisplay: shouldDisplay
    });
    
    return shouldDisplay;
  };

  // --- HELPER: Centralized Status Updater ---
  const updateAgentStatus = async (newStatus) => {
    try {
        setStatus(newStatus);
        console.log(`[STATUS UPDATE] Setting agent status to: ${newStatus}`);
        await fetch(`${BACKEND_URL}/agent/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
    } catch (err) {
        console.error("Status update failed:", err);
    }
  };

  // Fetch Agent ID from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const agentIdRef = ref(db, `agents/${user.uid}/agent_id`);
          const snapshot = await get(agentIdRef);

          if (snapshot.exists()) {
            const fetchedId = snapshot.val();
            console.log("🔥 Firebase: Fetched Agent ID:", fetchedId);
            setAgentDbId(fetchedId);
          } else {
            console.log("⚠️ No agent_id found for this user node.");
          }
        } catch (error) {
          console.error("Error fetching agent ID:", error);
        }
      } else {
        console.log("No user logged in.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Scheduled Orders from Employee Supabase (Dispatch Table)
  const fetchScheduledOrders = async (adminId) => {
    try {
      console.log("📦 Fetching scheduled orders for admin_id:", adminId);
      
      const { data, error } = await empSupabase
        .from('dispatch')
        .select('*')
        .eq('order_status', 'Scheduled')
        .eq('admin_id', adminId);

      if (error) {
        console.error("❌ Supabase fetch error:", error);
        return;
      }

      console.log("✅ Fetched scheduled orders (before time filter):", data);
      
      const filteredOrders = data.filter(order => {
        if (!order.scheduled_time) {
          console.log("⚠️ Order missing scheduled_time:", order);
          return false;
        }
        return shouldDisplayOrder(order.scheduled_time);
      });

      console.log("✅ Filtered scheduled orders (within 1 hour):", filteredOrders);
      
      const transformedOrders = filteredOrders.map(order => ({
        id: order.id,
        type: 'scheduled',
        orderId: order.order_id || order.id,
        customerName: order.customer_name || 'Unknown Customer',
        customerPhone: order.phone_number || 'N/A',
        address: order.request_address || 'No address provided',
        scheduledTime: order.scheduled_time,
        orderDetails: order,
        dispatchDetails: order
      }));

      setScheduledOrders(transformedOrders);
    } catch (err) {
      console.error("Error fetching scheduled orders:", err);
    }
  };

  // 🚀 NEW: Fetch App-Placed Orders from Main Supabase (Order Table)
  const fetchAppOrders = async (adminId) => {
    try {
      console.log("📱 Fetching app-placed orders for admin_id:", adminId);
      
      const { data, error } = await supabase
        .from('Order')
        .select(`
          order_id,
          order_status,
          service_category,
          service_subcategory,
          work_description,
          scheduled_date,
          preferred_time,
          created_at,
          user_id,
          member_id,
          address_id
        `)
        .eq('order_status', 'Placed')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ App orders fetch error:", error);
        return;
      }

      console.log("✅ Fetched app-placed orders:", data);

      // Transform and enrich with customer details
      const enrichedOrders = await Promise.all(data.map(async (order) => {
        let customerName = 'Unknown Customer';
        let customerPhone = 'N/A';
        let addressLine = 'Address not available';

        // Fetch customer phone from AllowedNumber
        if (order.member_id) {
          const { data: allowedData } = await supabase
            .from('AllowedNumber')
            .select('phone_number')
            .eq('member_id', order.member_id)
            .limit(1);
          
          if (allowedData && allowedData.length > 0) {
            customerPhone = allowedData[0].phone_number;
          }
        }

        // Fetch customer name from User table
        if (order.user_id) {
          const { data: userData } = await supabase
            .from('User')
            .select('name')
            .eq('user_id', order.user_id)
            .limit(1);
          
          if (userData && userData.length > 0) {
            customerName = userData[0].name || 'Unknown Customer';
          }
        }

        // Fetch address from Address table
        if (order.address_id) {
          const { data: addressData } = await supabase
            .from('Address')
            .select('address_line')
            .eq('address_id', order.address_id)
            .limit(1);
          
          if (addressData && addressData.length > 0) {
            addressLine = addressData[0].address_line;
          }
        }

        return {
          id: order.order_id,
          type: 'app-order',
          orderId: order.order_id,
          customerName: customerName,
          customerPhone: customerPhone,
          address: addressLine,
          serviceCategory: order.service_category,
          serviceSubcategory: order.service_subcategory,
          workDescription: order.work_description,
          scheduledDate: order.scheduled_date,
          preferredTime: order.preferred_time,
          createdAt: order.created_at,
          orderDetails: {
            ...order,
            customer_name: customerName,
            phone_number: customerPhone,
            request_address: addressLine
          }
        };
      }));

      setAppOrders(enrichedOrders);
    } catch (err) {
      console.error("Error fetching app orders:", err);
    }
  };

  // Setup Supabase Real-time Listeners
  useEffect(() => {
    if (!agentDbId) return;

    // Fetch initial data
    fetchScheduledOrders(agentDbId);
    fetchAppOrders(agentDbId);

    // Time-based refresh for scheduled orders
    const timeCheckInterval = setInterval(() => {
      console.log("🔄 Re-checking scheduled orders (time-based refresh)...");
      fetchScheduledOrders(agentDbId);
    }, 60000);

    console.log("🎧 Setting up Supabase real-time listeners...");
    
    // Listener for Dispatch table (Scheduled orders)
    const dispatchChannel = empSupabase
      .channel('dispatch-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispatch',
          filter: `admin_id=eq.${agentDbId}`
        },
        (payload) => {
          console.log("🔄 Dispatch table update:", payload);
          fetchScheduledOrders(agentDbId);
        }
      )
      .subscribe();

    // 🚀 NEW: Listener for Order table (App-placed orders)
    const orderChannel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Order',
          filter: `admin_id=eq.${agentDbId}`
        },
        (payload) => {
          console.log("🔄 Order table update:", payload);
          fetchAppOrders(agentDbId);
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 Unsubscribing from Supabase channels");
      clearInterval(timeCheckInterval);
      empSupabase.removeChannel(dispatchChannel);
      supabase.removeChannel(orderChannel);
    };
  }, [agentDbId]);

  // Socket.IO and Clock Setup
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    updateAgentStatus("online");

    const socket = io(BACKEND_URL);

    socket.on("incoming-call", (callData) => {
      console.log("📞 New call received:", callData);
      setIncomingCalls(prevCalls => [
        { ...callData, id: Date.now(), type: 'call' },
        ...prevCalls 
      ]);
    });

    return () => {
      socket.off("incoming-call");
      clearInterval(timer);
    };
  }, []);

  // Handle Accept Call
  const handleCallAccept = async (acceptedCall) => {
    await updateAgentStatus("busy");

    const dashboardLink = acceptedCall.dashboardLink;
    const callerNumber = acceptedCall.caller || null;
    const dispatchData = acceptedCall.dispatchDetails || null; 
    const customerName = acceptedCall.userName || null;

    if (dashboardLink) {
      console.log(`AgentDashboard: Accepting call. Redirecting to: ${dashboardLink}`); 
      
      navigate(dashboardLink, {
        state: {
          callerNumber: callerNumber,
          dispatchData: dispatchData,
          customerName: customerName,
          agentId: agentDbId
        }
      });
    } else {
      console.error("AgentDashboard: Cannot redirect. Missing dashboardLink.", acceptedCall); 
    }
    
    setIncomingCalls(prevCalls =>
      prevCalls.filter(call => call.id !== acceptedCall.id)
    );
  };

  // Handle Assign Scheduled Order
  const handleOrderAssign = async (order) => {
    await updateAgentStatus("busy");
    
    console.log("📋 Assigning scheduled order:", order);
    
    // Update status from 'Scheduled' to 'Scheduling' in Employee DB
    try {
      const { error: updateError } = await empSupabase
        .from('dispatch')
        .update({ order_status: 'Scheduling' })
        .eq('order_id', order.orderId);

      if (updateError) {
        console.error("❌ Failed to update order status to Scheduling:", updateError);
        alert("Failed to update order status. Please try again.");
        await updateAgentStatus("online");
        return;
      }

      console.log("✅ Order status updated to 'Scheduling'");

    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
      await updateAgentStatus("online");
      return;
    }

    // Navigate to ServiceManSelectionPage
    navigate('/user/servicemen', {
      state: {
        orderId: order.orderId,
        isScheduledDispatch: true,
        ticketId: order.orderDetails.ticket_id,
        phoneNumber: order.customerPhone,
        serviceName: order.orderDetails.category,
        requestDetails: order.orderDetails.order_request || 'Scheduled Service',
        request_address: order.address,
        adminId: agentDbId
      }
    });
  };

  // 🚀 NEW: Handle App Order Dispatch
  const handleAppOrderDispatch = async (order) => {
    await updateAgentStatus("busy");
    
    console.log("📱 Dispatching app-placed order:", order);
    
    // Update status from 'Placed' to 'Placing' in Main DB
    try {
      const { error: updateError } = await supabase
        .from('Order')
        .update({ 
          order_status: 'Placing',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', order.orderId);

      if (updateError) {
        console.error("❌ Failed to update order status to Placing:", updateError);
        alert("Failed to update order status. Please try again.");
        await updateAgentStatus("online");
        return;
      }

      console.log("✅ Order status updated to 'Placing'");

    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
      await updateAgentStatus("online");
      return;
    }

    // Parse selected services from order
    const selectedServices = {};
    if (order.serviceCategory) {
      const subcategories = order.serviceSubcategory 
        ? order.serviceSubcategory.split(',').map(s => s.trim())
        : [];
      selectedServices[order.serviceCategory] = subcategories;
    }

    // Navigate to ServiceManSelectionPage
    navigate('/user/servicemen', {
      state: {
        orderId: order.orderId,
        isAppOrder: true,
        phoneNumber: order.customerPhone,
        selectedServices: selectedServices,
        requestDetails: order.workDescription || 'App Order',
        request_address: order.address,
        adminId: agentDbId,
        userId: order.orderDetails.user_id,
        memberId: order.orderDetails.member_id,
        addressId: order.orderDetails.address_id
      }
    });
  };

  // Toggle Agent Status
  const toggleStatus = () => {
    const newStatus = status === "offline" ? "online" : "offline";
    updateAgentStatus(newStatus);
  };
   
  // Logout
  const handleLogout = async () => {
    try {
      await updateAgentStatus("offline");
      await signOut(auth);
      setAgentDbId(null);
      console.log("Agent logged out successfully.");
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const isOnline = status === "online";
  const isBusy = status === "busy";

  const totalItems = incomingCalls.length + scheduledOrders.length + appOrders.length;

  // --- INLINE STYLES ---
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f3f4f6',
      color: '#111827',
    },
    header: {
      height: '64px',
      backgroundColor: '#1f2937', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 20,
    },
    brand: {
      fontSize: '1.25rem',
      fontWeight: '700',
      letterSpacing: '-0.025em',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    },
    clock: {
      fontFamily: 'monospace',
      color: '#9ca3af',
      fontSize: '0.95rem',
    },
    logoutButton: {
      backgroundColor: '#f87171', 
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginLeft: '15px',
    },
    avatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: '600',
      border: '2px solid #4b5563',
    },
    main: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    sidebar: {
      width: '280px',
      backgroundColor: 'white',
      borderRight: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    },
    statusCard: {
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
    },
    statusLabel: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#6b7280',
      fontWeight: '600',
      marginBottom: '12px',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 16px',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      backgroundColor: isOnline ? '#ecfdf5' : isBusy ? '#fff7ed' : '#f3f4f6',
      color: isOnline ? '#047857' : isBusy ? '#c2410c' : '#374151',
      border: `1px solid ${isOnline ? '#a7f3d0' : isBusy ? '#fdba74' : '#d1d5db'}`,
      marginBottom: '20px',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: isOnline ? '#10b981' : isBusy ? '#f97316' : '#9ca3af',
    },
    toggleBtn: {
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: '600',
      fontSize: '0.875rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: isOnline ? '#ef4444' : '#10b981',
      color: 'white',
      opacity: isBusy ? 0.5 : 1,
      pointerEvents: isBusy ? 'none' : 'auto',
      boxShadow: isOnline 
        ? '0 4px 6px -1px rgba(239, 68, 68, 0.2)' 
        : '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
    },
    stats: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #f3f4f6',
    },
    statKey: {
      fontSize: '0.875rem',
      color: '#6b7280',
    },
    statVal: {
      fontSize: '0.875rem',
      fontWeight: '700',
      color: '#111827',
    },
    contentArea: {
      flex: 1,
      padding: '32px',
      backgroundColor: '#f3f4f6',
      overflowY: 'auto',
    },
    queueHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
    },
    queueTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#111827',
      margin: 0,
    },
    countBadge: {
      backgroundColor: '#3b82f6',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600',
      padding: '4px 12px',
      borderRadius: '9999px',
    },
    sectionTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#374151',
      marginTop: '32px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    empty: {
      height: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '2px dashed #e5e7eb',
      color: '#9ca3af',
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '16px',
      opacity: 0.5,
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>CC Agent Console</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.clock}>{currentTime}</span>
          {agentDbId && <span style={{fontSize: '0.8rem', color: '#ccc'}}>ID: {agentDbId}</span>}
          <div style={styles.avatar}>JD</div>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.main}>
        <aside style={styles.sidebar}>
          <div style={styles.statusCard}>
            <div style={styles.statusLabel}>Current Status</div>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot}></span>
              {status.toUpperCase()}
            </div>
            
            <button style={styles.toggleBtn} onClick={toggleStatus}>
              {isOnline ? 'Go Offline' : isBusy ? 'Agent Busy' : 'Go Online'}
            </button>
          </div>

          <div style={styles.stats}>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Calls Today</span>
              <span style={styles.statVal}>12</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Scheduled Orders</span>
              <span style={styles.statVal}>{scheduledOrders.length}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>App Orders</span>
              <span style={styles.statVal}>{appOrders.length}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Avg Handle Time</span>
              <span style={styles.statVal}>4m 22s</span>
            </div>
          </div>
        </aside>

        <main style={styles.contentArea}>
          <div style={styles.queueHeader}>
            <h2 style={styles.queueTitle}>Queue Overview</h2>
            <span style={styles.countBadge}>{totalItems} Total Items</span>
          </div>

          {totalItems === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>
                {isOnline ? '📡' : isBusy ? '⏳' : '🌙'}
              </div>
              <h3 style={{margin: 0, color: '#374151'}}>
                {isOnline ? 'Waiting for calls and orders...' : isBusy ? 'Agent is Busy' : 'You are currently offline'}
              </h3>
              <p style={{marginTop: '8px', fontSize: '0.875rem'}}>
                {isOnline 
                  ? 'System is active and listening.' 
                  : isBusy
                  ? 'Complete your current task to receive new ones.'
                  : 'Go online to start receiving calls and orders.'}
              </p>
            </div>
          ) : (
            <>
              {incomingCalls.length > 0 && (
                <>
                  <h3 style={styles.sectionTitle}>
                    📞 Incoming Calls ({incomingCalls.length})
                  </h3>
                  <div style={styles.grid}>
                    {incomingCalls.map(call => (
                      <CallCard 
                        key={call.id} 
                        callData={call} 
                        onAccept={handleCallAccept} 
                      />
                    ))}
                  </div>
                </>
              )}

              {scheduledOrders.length > 0 && (
                <>
                  <h3 style={styles.sectionTitle}>
                    📋 Scheduled Orders ({scheduledOrders.length})
                  </h3>
                  <div style={styles.grid}>
                    {scheduledOrders.map(order => (
                      <CallCard 
                        key={order.id} 
                        callData={order} 
                        onAccept={handleOrderAssign}
                        isScheduledOrder={true}
                      />
                    ))}
                  </div>
                </>
              )}

              {appOrders.length > 0 && (
                <>
                  <h3 style={styles.sectionTitle}>
                    📱 App Orders ({appOrders.length})
                  </h3>
                  <div style={styles.grid}>
                    {appOrders.map(order => (
                      <CallCard 
                        key={order.id} 
                        callData={order} 
                        onAccept={handleAppOrderDispatch}
                        isAppOrder={true}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
