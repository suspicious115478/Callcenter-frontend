import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Inline SVG Icon Definitions (Replacing lucide-react) ---

// PlusCircle (24x24)
const PlusCircle = ({ size = 24, className = "", style = {} }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
    </svg>
);

// Trash2 (16x16 or 24x24)
const Trash2 = ({ size = 24, className = "", style = {} }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

// TrendingUp (24x24)
const TrendingUp = ({ size = 24, className = "", style = {} }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="22 7 13.5 15.5 10.5 12.5 2 21" />
        <polyline points="18 7 22 7 22 11" />
    </svg>
);

// TrendingDown (24x24)
const TrendingDown = ({ size = 24, className = "", style = {} }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <polyline points="22 17 13.5 8.5 10.5 11.5 2 3" />
        <polyline points="18 17 22 17 22 13" />
    </svg>
);

// DollarSign (24x24)
const DollarSign = ({ size = 24, className = "", style = {} }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

// Phone (20x20 or 24x24)
const Phone = ({ size = 24, className = "", style = {} }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

// LogOut (20x20 or 24x24)
const LogOut = ({ size = 24, className = "", style = {} }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);


// --- MOCKED BACKEND URL ---
// Note: This URL is used for demonstrating the fetch call logic.
const BACKEND_URL = "https://callcenter-baclend.onrender.com/"; 

// =========================================================================
// 1. UserService Component (Financial Activity Tracker - Destination Page)
// The service page to redirect to after successful request intake.
// =========================================================================

const UserServicePage = ({ onGoBack }) => {
    const [activities, setActivities] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');

    const styles = useMemo(() => ({
        incomeColor: '#10B981', // Emerald green 500
        expenseColor: '#EF4444', // Red 500
    }), []);

    const formatCurrency = useCallback((value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }, []);

    const { totalIncome, totalExpense, netBalance } = useMemo(() => {
        const income = activities.filter(a => a.type === 'income').reduce((sum, a) => sum + parseFloat(a.amount), 0);
        const expense = activities.filter(a => a.type === 'expense').reduce((sum, a) => sum + parseFloat(a.amount), 0);
        return { totalIncome: income, totalExpense: expense, netBalance: income - expense };
    }, [activities]);

    const addActivity = useCallback(() => {
        const parsedAmount = parseFloat(amount);
        if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
        const newActivity = { id: Date.now(), description: description.trim(), amount: parsedAmount, type: type, date: new Date().toLocaleDateString() };
        setActivities(prev => [newActivity, ...prev]);
        setDescription('');
        setAmount('');
        setType('expense');
    }, [description, amount, type]);

    const deleteActivity = useCallback((id) => {
        setActivities(prev => prev.filter(activity => activity.id !== id));
    }, []);

    const SummaryCard = ({ title, value, color, icon: Icon }) => (
        <div className={`p-6 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-36 border-t-4`} style={{ borderColor: color }}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
                <Icon size={24} style={{ color }} />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 mt-4 break-words">
                {formatCurrency(value)}
            </p>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Financial Services</h1>
                    <p className="text-gray-500 mt-1">Manage user's financial profile and history.</p>
                </div>
                <button
                    onClick={onGoBack}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    <LogOut size={20} className="mr-2 rotate-180" />
                    Back to Dashboard
                </button>
            </header>

            {/* Summary Dashboard */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <SummaryCard
                    title="Net Balance"
                    value={netBalance}
                    color={netBalance >= 0 ? styles.incomeColor : styles.expenseColor}
                    icon={DollarSign}
                />
                <SummaryCard title="Total Income" value={totalIncome} color={styles.incomeColor} icon={TrendingUp} />
                <SummaryCard title="Total Expenses" value={totalExpense} color={styles.expenseColor} icon={TrendingDown} />
            </section>

            {/* Activity History & Form (kept simple) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-4">Activity Editor</h2>
                 <section className="mb-8">
                    <h3 className="text-xl font-medium text-gray-700 mb-4">Record New Activity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Salary, Rent"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={addActivity}
                            className="flex items-center px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            disabled={!description.trim() || parseFloat(amount) <= 0}
                        >
                            <PlusCircle size={20} className="mr-2" />
                            Add Transaction
                        </button>
                    </div>
                </section>
                
                {/* History List */}
                <h3 className="text-xl font-medium text-gray-700 mb-4 border-t pt-4">Transaction History</h3>
                <div className="divide-y divide-gray-100">
                    {activities.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No transactions recorded.
                        </div>
                    ) : (
                        activities.map((activity) => {
                            const isExpense = activity.type === 'expense';
                            const amountDisplay = isExpense ? `- ${formatCurrency(activity.amount)}` : `+ ${formatCurrency(activity.amount)}`;
                            const color = isExpense ? styles.expenseColor : styles.incomeColor;

                            return (
                                <div 
                                    key={activity.id}
                                    className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-grow min-w-0">
                                        <p className="text-base font-medium text-gray-900 truncate" title={activity.description}>
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {activity.date} - <span className={`capitalize font-semibold`} style={{ color }}>{activity.type}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4">
                                        <p className="text-base font-bold w-24 text-right break-words" style={{ color }}>
                                            {amountDisplay}
                                        </p>
                                        <button 
                                            onClick={() => deleteActivity(activity.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                            title="Delete Activity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};


// =========================================================================
// 2. UserDashboard Component (Call Center Console - Intake Page)
// Handles the request intake, saves to backend, and redirects on success.
// =========================================================================

const UserDashboardPage = ({ onServiceRedirect }) => {
    // State to simulate the dynamically accepted phone number
    const [callNumber, setCallNumber] = useState("555-0123-4567"); // Initial mock value
    // NOTE: In a real app, this would be set by an external telephony service hook.

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    
    // Form state
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("support");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSaveNotes = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Use the actual number from the input field/state
        const phoneNumberToSend = callNumber.trim(); 

        if (!notes.trim() || !phoneNumberToSend) {
            setError("Please enter a call number and notes before saving.");
            return;
        }

        setIsSaving(true);

        // Exponential backoff retry logic
        const maxRetries = 3;
        const initialDelay = 1000; // 1 second
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(`${BACKEND_URL}api/logs/save`, { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: phoneNumberToSend, // Using the actual state number
                        category: category,
                        notes: notes,
                        agentName: "Agent JD"  
                    })
                });

                if (!response.ok) {
                    const errorDetail = await response.text();
                    const errorMessage = errorDetail ? errorDetail.substring(0, 100) : "No error details provided.";
                    throw new Error(`Server Error (${response.status}): ${errorMessage}...`);
                }

                let result;
                const text = await response.text();

                if (!text) {
                    result = { success: true, message: "No content returned, assuming successful save." };
                } else {
                    try {
                        result = JSON.parse(text);
                    } catch (e) {
                        throw new Error(`Invalid JSON format in response: ${e.message}`);
                    }
                }
                
                if (result.success) {
                    setError("✅ Successfully logged request. Redirecting to User Services...");
                    
                    // Successful submission: Redirect to UserService page
                    setTimeout(onServiceRedirect, 1000); 

                    // Clear form after successful submission
                    setNotes(""); 
                    setCategory("support");
                    return; // Exit the function on success

                } else {
                    console.error("Failed to save log:", result.message);
                    throw new Error("Failed to save log: " + (result.message || "Unknown error occurred."));
                }
            } catch (err) {
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, attempt)));
                    // Do not log retry as an error
                } else {
                    console.error("Save Error after retries:", err.message);
                    setError(`❌ ${err.message}`);
                }
            } finally {
                if (attempt === maxRetries - 1) setIsSaving(false);
            }
        }
    };

    // --- Combined Styles (Tailwind equivalent for this single-file context) ---
    const styles = useMemo(() => ({
        // Use functional styles where needed, otherwise rely on Tailwind classes
        errorBox: (isSuccess) => ({
            backgroundColor: isSuccess ? '#ecfdf5' : '#fef2f2',
            border: isSuccess ? '1px solid #a7f3d0' : '1px solid #fca5a5',
            color: isSuccess ? '#047857' : '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
        }),
    }), []);

    const isSuccess = error && error.startsWith("✅");

    return (
        <div className="flex flex-col min-h-screen font-['Inter'] bg-gray-50 text-gray-900">
            {/* HEADER */}
            <header className="h-16 bg-gray-800 text-white flex items-center justify-between px-6 shadow-md z-20">
                <div className="text-xl font-bold tracking-tight flex items-center space-x-2">
                    <Phone size={20} />
                    <span>CC Agent Console</span>
                </div>
                <div className="flex items-center space-x-6">
                    <span className="font-mono text-gray-400 text-sm">{currentTime}</span>
                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold border-2 border-gray-600">JD</div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row flex-1 p-8 gap-8 max-w-7xl mx-auto w-full">
                {/* LEFT PANEL: INTAKE FORM */}
                <div className="flex-1 min-w-[350px] max-w-full flex flex-col space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">📝 New Request Intake</h2>
                            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                                <span>✓ Verified Subscriber</span>
                            </div>
                        </div>
                        <div className="p-6">
                            {error && <div style={styles.errorBox(isSuccess)}>{error}</div>}
                            <form onSubmit={handleSaveNotes}>
                                {/* Call Number Input (Using actual state number) */}
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Active Call Number
                                    </label>
                                    <input
                                        type="text"
                                        value={callNumber}
                                        onChange={(e) => setCallNumber(e.target.value)}
                                        placeholder="e.g., 555-123-4567"
                                        className="w-full p-2 border border-blue-300 rounded-lg text-lg font-bold focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Category</label>
                                    <select 
                                        className="w-full p-2 border border-gray-300 rounded-lg text-base bg-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="support">Technical Support</option>
                                        <option value="billing">Billing Inquiry</option>
                                        <option value="upgrade">Plan Upgrade</option>
                                        <option value="cancellation">Cancellation Request</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes & Request Details</label>
                                    <textarea 
                                        className="w-full p-3 border border-gray-300 rounded-lg text-base min-h-[120px] resize-y focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Type detailed notes about the customer's request here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors mt-2 
                                        ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    {isSaving ? "Saving..." : "Save Request Log & Select Service"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: USER DETAILS & HISTORY */}
                <div className="w-full lg:w-[380px] min-w-[300px] flex flex-col space-y-6">
                    {/* CUSTOMER PROFILE CARD */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Customer Profile</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between mb-3 text-sm">
                                <span className="text-gray-500">Phone Number</span>
                                <span className="font-semibold text-gray-900">{callNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between mb-3 text-sm">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-green-600">Active</span>
                            </div>
                            <div className="flex justify-between mb-3 text-sm">
                                <span className="text-gray-500">Member Since</span>
                                <span className="font-semibold text-gray-900">Jan 2024</span>
                            </div>
                            <div className="flex justify-between mb-3 text-sm">
                                <span className="text-gray-500">Current Plan</span>
                                <span className="font-semibold text-gray-900">Premium</span>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY CARD */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Recent History</h2>
                        </div>
                        <div className="p-6 divide-y divide-gray-100">
                            <div className="py-3 text-sm">
                                <div className="text-xs text-gray-400 mb-1">Today, 10:30 AM</div>
                                <div><strong>System Check:</strong> Auto-verified subscription status via IVR.</div>
                            </div>
                            <div className="py-3 text-sm">
                                <div className="text-xs text-gray-400 mb-1">Yesterday</div>
                                <div><strong>Billing:</strong> Invoice #4492 generated.</div>
                            </div>
                            <div className="py-3 text-sm border-b-0">
                                <div className="text-xs text-gray-400 mb-1">2 days ago</div>
                                <div><strong>Login:</strong> Successful web login.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 3. App Router Component (Container)
// =========================================================================

export default function App() {
    const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'service'

    const handleRedirect = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {currentPage === 'dashboard' ? (
                <UserDashboardPage onServiceRedirect={() => handleRedirect('service')} />
            ) : (
                <UserServicePage onGoBack={() => handleRedirect('dashboard')} />
            )}
        </div>
    );
}
