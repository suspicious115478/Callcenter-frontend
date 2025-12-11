import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { createClient } from '@supabase/supabase-js';
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom"; 
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database"; 
import { app } from "../config"; 

// Initialize Firebase Auth & DB
const auth = getAuth(app); 
const db = getDatabase(app);

// Initialize Supabase Client (Main DB)
const supabaseUrl = 'https://wbtslpyulsskgdtkknaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHNscHl1bHNza2dkdGtrbmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc0MDgsImV4cCI6MjA3OTIyMzQwOH0.BcvA4VFPybxQvQRNpt1e0NvDNATrhddx5RgvWAYgQM0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Employee Supabase Client
const empSupabaseUrl = 'https://wbtslpyulsskgdtkknaf.supabase.co'; 
const empSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidHNscHl1bHNza2dkdGtrbmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc0MDgsImV4cCI6MjA3OTIyMzQwOH0.BcvA4VFPybxQvQRNpt1e0NvDNATrhddx5RgvWAYgQM0'; 
const empSupabase = createClient(empSupabaseUrl, empSupabaseAnonKey);

export default function AgentDashboard() {
  const navigate = useNavigate(); 

  const [status, setStatus] = useState("offline");
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [scheduledOrders, setScheduledOrders] = useState([]);
  const [placedOrders, setPlacedOrders] = useState([]); 
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [agentDbId, setAgentDbId] = useState(null); 
  const [loading, setLoading] = useState(true);

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

  // --- HELPER: Check if order should be displayed ---
  const shouldDisplayOrder = (scheduledTimeString) => {
    const scheduledTime = parseScheduledTime(scheduledTimeString);
    if (!scheduledTime) return false;
    
    const now = new Date();
    const oneHourBefore = new Date(scheduledTime.getTime() - (60 * 60 * 1000));
    
    return now >= oneHourBefore;
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

  // --- DATA FETCHING HELPERS ---
  const fetchCustomerDetails = async (userId, memberId) => {
    try {
      let customerName = 'Unknown Customer';
      let customerPhone = 'N/A';

      if (memberId) {
        const { data: phoneData } = await supabase.from('AllowedNumber').select('phone_number').eq('member_id', memberId).limit(1);
        if (phoneData?.[0]) customerPhone = phoneData[0].phone_number;

        const { data: memberData } = await supabase.from('Member').select('name').eq('member_id', memberId).limit(1);
        if (memberData?.[0]?.name) customerName = memberData[0].name;
      }

      if (customerName === 'Unknown Customer' && userId) {
        const { data: userData } = await supabase.from('User').select('name').eq('user_id', userId).limit(1);
        if (userData?.[0]?.name) customerName = userData[0].name;
      }

      return { customerName, customerPhone };
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return { customerName: 'Unknown Customer', customerPhone: 'N/A' };
    }
  };

  const fetchAddress = async (addressId) => {
    if (!addressId) return 'No address provided';
    try {
      const { data, error } = await supabase.from('Address').select('address_line').eq('address_id', addressId).limit(1);
      if (error || !data || data.length === 0) return 'Address not found';
      return data[0].address_line;
    } catch (error) {
      return 'Error loading address';
    }
  };

  // --- EFFECTS ---

  // 1. Fetch Agent ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const agentIdRef = ref(db, `agents/${user.uid}/agent_id`);
          const snapshot = await get(agentIdRef);
          if (snapshot.exists()) {
            setAgentDbId(snapshot.val());
          }
        } catch (error) {
          console.error("Error fetching agent ID:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Fetching Functions
  const fetchScheduledOrders = async (adminId) => {
    try {
      const { data, error } = await empSupabase.from('dispatch').select('*').eq('order_status', 'Scheduled').eq('admin_id', adminId);
      if (error) return;

      const filteredOrders = data.filter(order => {
        if (!order.scheduled_time) return false;
        return shouldDisplayOrder(order.scheduled_time);
      });

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

  const fetchPlacedOrders = async (adminId) => {
    try {
      const { data, error } = await supabase.from('Order').select('*').eq('order_status', 'Placed').eq('admin_id', adminId).order('created_at', { ascending: false });
      if (error) return;

      const transformedOrders = await Promise.all(
        data.map(async (order) => {
          const { customerName, customerPhone } = await fetchCustomerDetails(order.user_id, order.member_id);
          const address = await fetchAddress(order.address_id);
          return {
            id: order.order_id,
            type: 'placed',
            orderId: order.order_id,
            customerName,
            customerPhone,
            address,
            serviceCategory: order.service_category || 'General Service',
            workDescription: order.work_description || 'Service Request',
            createdAt: order.created_at,
            orderDetails: order
          };
        })
      );
      setPlacedOrders(transformedOrders);
    } catch (err) {
      console.error("Error fetching placed orders:", err);
    }
  };

  // 3. Real-time Listeners
  useEffect(() => {
    if (!agentDbId) return;

    fetchScheduledOrders(agentDbId);
    fetchPlacedOrders(agentDbId);

    const timeCheckInterval = setInterval(() => {
      fetchScheduledOrders(agentDbId);
    }, 60000);

    const dispatchChannel = empSupabase.channel('dispatch-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dispatch', filter: `admin_id=eq.${agentDbId}` }, 
      () => fetchScheduledOrders(agentDbId))
      .subscribe();

    const orderChannel = supabase.channel('order-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Order', filter: `admin_id=eq.${agentDbId}` }, 
      () => fetchPlacedOrders(agentDbId))
      .subscribe();

    return () => {
      clearInterval(timeCheckInterval);
      supabase.removeChannel(orderChannel);
      empSupabase.removeChannel(dispatchChannel);
    };
  }, [agentDbId]);

  // 4. Socket & Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    updateAgentStatus("online");

    const socket = io(BACKEND_URL);
    socket.on("incoming-call", (callData) => {
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

  // --- ACTION HANDLERS ---

  const handleCallAccept = async (acceptedCall) => {
    await updateAgentStatus("busy");
    if (acceptedCall.dashboardLink) {
      navigate(acceptedCall.dashboardLink, {
        state: {
          callerNumber: acceptedCall.caller,
          dispatchData: acceptedCall.dispatchDetails,
          customerName: acceptedCall.userName,
          agentId: agentDbId
        }
      });
    }
    setIncomingCalls(prev => prev.filter(call => call.id !== acceptedCall.id));
  };

  const handleOrderAssign = async (order) => {
    await updateAgentStatus("busy");
    try {
      const { error } = await empSupabase.from('dispatch').update({ order_status: 'Scheduling' }).eq('order_id', order.orderId);
      if (error) throw error;
      
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
    } catch (err) {
      alert("Failed to update order status.");
      await updateAgentStatus("online");
    }
  };

  const handlePlacedOrderDispatch = async (order) => {
    await updateAgentStatus("busy");
    try {
      const { error } = await supabase.from('Order').update({ order_status: 'Placing' }).eq('order_id', order.orderId);
      if (error) throw error;

      navigate('/user/servicemen', {
        state: {
          orderId: order.orderId,
          isScheduledDispatch: false,
          isPlacedOrder: true,
          ticketId: `APP-${order.orderId}`,
          phoneNumber: order.customerPhone,
          serviceName: order.serviceCategory,
          requestDetails: order.workDescription,
          request_address: order.address,
          adminId: agentDbId,
          selectedServices: { [order.serviceCategory]: [] }
        }
      });
    } catch (err) {
      alert("Failed to dispatch order.");
      await updateAgentStatus("online");
    }
  };

  const toggleStatus = () => {
    const newStatus = status === "offline" ? "online" : "offline";
    updateAgentStatus(newStatus);
  };
   
  const handleLogout = async () => {
    await updateAgentStatus("offline");
    await signOut(auth);
    setAgentDbId(null);
  };

  const isOnline = status === "online";
  const isBusy = status === "busy";
  const totalItems = incomingCalls.length + scheduledOrders.length + placedOrders.length;

  // --- STYLES ---
  const styles = {
    container: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#f3f4f6', color: '#111827' },
    header: { height: '64px', backgroundColor: '#1f2937', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 20 },
    brand: { fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '24px' },
    clock: { fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.95rem' },
    logoutButton: { backgroundColor: '#f87171', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', marginLeft: '15px' },
    avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', border: '2px solid #4b5563' },
    main: { display: 'flex', flex: 1, overflow: 'hidden' },
    sidebar: { width: '280px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' },
    statusCard: { padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center' },
    statusLabel: { fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600', marginBottom: '12px' },
    statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '20px', backgroundColor: isOnline ? '#ecfdf5' : isBusy ? '#fff7ed' : '#f3f4f6', color: isOnline ? '#047857' : isBusy ? '#c2410c' : '#374151', border: `1px solid ${isOnline ? '#a7f3d0' : isBusy ? '#fdba74' : '#d1d5db'}` },
    statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOnline ? '#10b981' : isBusy ? '#f97316' : '#9ca3af' },
    toggleBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: isOnline ? '#ef4444' : '#10b981', color: 'white', opacity: isBusy ? 0.5 : 1 },
    stats: { display: 'flex', flexDirection: 'column', gap: '16px' },
    statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' },
    statKey: { fontSize: '0.875rem', color: '#6b7280' },
    statVal: { fontSize: '0.875rem', fontWeight: '700', color: '#111827' },
    contentArea: { flex: 1, padding: '32px', backgroundColor: '#f3f4f6', overflowY: 'auto' },
    queueHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' },
    queueTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 },
    countBadge: { backgroundColor: '#3b82f6', color: 'white', fontSize: '0.875rem', fontWeight: '600', padding: '4px 12px', borderRadius: '9999px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' },
    empty: { height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #e5e7eb', color: '#9ca3af' },
    emptyIcon: { fontSize: '3rem', marginBottom: '16px', opacity: 0.5 },
    // Card Styles
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.2s', border: '1px solid #e5e7eb' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tag: { fontSize: '0.75rem', fontWeight: '700', padding: '4px 8px', borderRadius: '6px' },
    time: { fontSize: '0.75rem', color: '#6b7280' },
    cardTitle: { margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111827' },
    cardInfo: { margin: 0, fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' },
    actionBtn: { marginTop: '8px', padding: '10px', width: '100%', border: 'none', borderRadius: '8px', fontWeight: '600', color: 'white', cursor: 'pointer', transition: 'opacity 0.2s' }
  };

  if (loading) return <div style={{...styles.container, alignItems: 'center', justifyContent: 'center'}}>Loading Agent Profile...</div>;

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
          <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
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
            <div style={styles.statRow}><span style={styles.statKey}>Calls Queue</span><span style={{...styles.statVal, color: '#ef4444'}}>{incomingCalls.length}</span></div>
            <div style={styles.statRow}><span style={styles.statKey}>App Orders</span><span style={{...styles.statVal, color: '#3b82f6'}}>{placedOrders.length}</span></div>
            <div style={styles.statRow}><span style={styles.statKey}>Scheduled</span><span style={{...styles.statVal, color: '#10b981'}}>{scheduledOrders.length}</span></div>
          </div>
        </aside>

        <main style={styles.contentArea}>
          <div style={styles.queueHeader}>
            <h2 style={styles.queueTitle}>Work Queue</h2>
            <span style={styles.countBadge}>{totalItems} Active Items</span>
          </div>

          {totalItems === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>{isOnline ? '📡' : '🌙'}</div>
              <h3 style={{margin: 0, color: '#374151'}}>
                {isOnline ? 'Waiting for calls and orders...' : 'Agent is offline'}
              </h3>
            </div>
          ) : (
            <div style={styles.grid}>
              {/* 1. INCOMING CALLS - RED */}
              {incomingCalls.map(call => (
                <div key={call.id} style={{...styles.card, borderLeft: '4px solid #ef4444'}}>
                  <div style={styles.cardHeader}>
                    <span style={{...styles.tag, backgroundColor: '#fee2e2', color: '#991b1b'}}>INCOMING CALL</span>
                    <span style={styles.time}>Just now</span>
                  </div>
                  <h3 style={styles.cardTitle}>{call.userName || 'Unknown Caller'}</h3>
                  <div style={styles.cardInfo}>📞 {call.caller}</div>
                  <div style={styles.cardInfo}>📍 {call.dispatchDetails?.request_address?.substring(0,25) || 'Locating...'}</div>
                  <button style={{...styles.actionBtn, backgroundColor: '#ef4444'}} onClick={() => handleCallAccept(call)}>
                    Accept Call
                  </button>
                </div>
              ))}

              {/* 2. PLACED APP ORDERS - BLUE */}
              {placedOrders.map(order => (
                <div key={order.id} style={{...styles.card, borderLeft: '4px solid #3b82f6'}}>
                  <div style={styles.cardHeader}>
                    <span style={{...styles.tag, backgroundColor: '#dbeafe', color: '#1e40af'}}>APP ORDER</span>
                    <span style={styles.time}>
                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <h3 style={styles.cardTitle}>{order.serviceCategory}</h3>
                  <div style={styles.cardInfo}>👤 {order.customerName}</div>
                  <div style={styles.cardInfo}>📍 {order.address.length > 30 ? order.address.substring(0,30) + '...' : order.address}</div>
                  <div style={{...styles.cardInfo, fontStyle: 'italic', color: '#6b7280'}}>"{order.workDescription}"</div>
                  <button style={{...styles.actionBtn, backgroundColor: '#3b82f6'}} onClick={() => handlePlacedOrderDispatch(order)}>
                    Dispatch Agent
                  </button>
                </div>
              ))}

              {/* 3. SCHEDULED ORDERS - GREEN */}
              {scheduledOrders.map(order => (
                <div key={order.id} style={{...styles.card, borderLeft: '4px solid #10b981'}}>
                  <div style={styles.cardHeader}>
                    <span style={{...styles.tag, backgroundColor: '#d1fae5', color: '#065f46'}}>SCHEDULED</span>
                    <span style={styles.time}>{order.scheduledTime}</span>
                  </div>
                  <h3 style={styles.cardTitle}>{order.orderDetails.category || 'Service'}</h3>
                  <div style={styles.cardInfo}>👤 {order.customerName}</div>
                  <div style={styles.cardInfo}>📍 {order.address.length > 30 ? order.address.substring(0,30) + '...' : order.address}</div>
                  <button style={{...styles.actionBtn, backgroundColor: '#10b981'}} onClick={() => handleOrderAssign(order)}>
                    Assign Serviceman
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
