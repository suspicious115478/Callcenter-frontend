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
    const [activities, setActivities] = useState([
        { id: 1, description: 'Initial Deposit', amount: 5000.00, type: 'income', date: '10/20/2024' },
        { id: 2, description: 'Monthly Rent Payment', amount: 1500.00, type: 'expense', date: '10/22/2024' },
        { id: 3, description: 'Groceries', amount: 150.00, type: 'expense', date: '10/24/2024' },
    ]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');

    const styles = useMemo(() => ({
        incomeColor: '#059669', // Emerald green 600
        expenseColor: '#DC2626', // Red 600
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

    const SummaryCard = ({ title, value, color, icon: Icon }) => {
        const isNegative = value < 0;
        const displayColor = isNegative && title === 'Net Balance' ? styles.expenseColor : color;
        const IconComponent = Icon || DollarSign;

        return (
            <div className={`p-6 bg-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.01] flex flex-col justify-between h-36 border-b-4 ${isNegative ? 'border-red-500' : 'border-emerald-500'}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
                    <IconComponent size={24} className="text-gray-400" style={{ color: displayColor }} />
                </div>
                <p className={`text-3xl font-extrabold mt-4 break-words`} style={{ color: displayColor }}>
                    {formatCurrency(value)}
                </p>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto font-['Inter']">
            <header className="mb-8 pb-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">User Financial Services</h1>
                    <p className="text-gray-500 mt-1">Real-time view and management of the user's financial profile.</p>
                </div>
                <button
                    onClick={onGoBack}
                    className="flex items-center px-4 py-2 mt-4 sm:mt-0 bg-white text-gray-700 font-semibold rounded-full shadow-md hover:bg-gray-100 transition-colors border border-gray-300 text-sm"
                >
                    <LogOut size={20} className="mr-2 rotate-180" />
                    Back to Console
                </button>
            </header>

            {/* Summary Dashboard */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <SummaryCard
                    title="Net Balance"
                    value={netBalance}
                    color={styles.incomeColor} // Color handled inside card based on positive/negative
                    icon={DollarSign}
                />
                <SummaryCard title="Total Income" value={totalIncome} color={styles.incomeColor} icon={TrendingUp} />
                <SummaryCard title="Total Expenses" value={totalExpense} color={styles.expenseColor} icon={TrendingDown} />
            </section>

            {/* Activity History & Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Financial Activity Manager</h2>
                
                {/* Record New Activity Form */}
                <section className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Record New Transaction</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Freelance payment, Utility Bill"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white transition-colors shadow-sm"
                            >
                                <option value="expense">Expense (Outflow)</option>
                                <option value="income">Income (Inflow)</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={addActivity}
                            className="flex items-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:shadow-none"
                            disabled={!description.trim() || parseFloat(amount) <= 0}
                        >
                            <PlusCircle size={20} className="mr-2" />
                            Add Transaction
                        </button>
                    </div>
                </section>
                
                {/* History List */}
                <h3 className="text-xl font-semibold text-gray-700 mb-4 border-t pt-4">Transaction History</h3>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                    {activities.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 bg-gray-50">
                            No transactions recorded yet. Use the form above to add one.
                        </div>
                    ) : (
                        activities.map((activity) => {
                            const isExpense = activity.type === 'expense';
                            const amountDisplay = isExpense ? `- ${formatCurrency(activity.amount)}` : `+ ${formatCurrency(activity.amount)}`;
                            const color = isExpense ? styles.expenseColor : styles.incomeColor;

                            return (
                                <div 
                                    key={activity.id}
                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-emerald-50/50 transition-colors border-l-4"
                                    style={{ borderColor: isExpense ? '#fca5a5' : '#a7f3d0' }}
                                >
                                    <div className="flex-grow min-w-0 mb-2 sm:mb-0">
                                        <p className="text-base font-semibold text-gray-900 truncate" title={activity.description}>
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {activity.date} | <span className={`capitalize font-medium`} style={{ color }}>{activity.type}</span>
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4">
                                        <p className="text-lg font-extrabold w-32 text-right break-words" style={{ color }}>
                                            {amountDisplay}
                                        </p>
                                        <button 
                                            onClick={() => deleteActivity(activity.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-100 flex-shrink-0"
                                            title="Delete Transaction"
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
            setError("❌ Please enter a call number and notes before saving.");
            return;
        }

        setIsSaving(true);

        // Exponential backoff retry logic
        const maxRetries = 3;
        const initialDelay = 1000; // 1 second
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Mocking the fetch call since the endpoint is unavailable
                const response = {
                    ok: true,
                    status: 200,
                    text: async () => JSON.stringify({ success: true, message: "Log saved successfully (Mock)." }),
                };
                
                // await fetch(`${BACKEND_URL}api/logs/save`, {
                //     method: "POST",
                //     headers: { "Content-Type": "application/json" },
                //     body: JSON.stringify({
                //         phone: phoneNumberToSend,
                //         category: category,
                //         notes: notes,
                //         agentName: "Agent JD"
                //     })
                // });

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
                    setError(`❌ Failed to connect: ${err.message}`);
                }
            } finally {
                if (attempt === maxRetries - 1) setIsSaving(false);
            }
        }
    };

    // --- Combined Styles (Tailwind equivalent for this single-file context) ---
    const getErrorBoxStyle = (isSuccess) => ({
        backgroundColor: isSuccess ? '#ecfdf5' : '#fef2f2',
        border: isSuccess ? '1px solid #a7f3d0' : '1px solid #fca5a5',
        color: isSuccess ? '#047857' : '#dc2626',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9rem',
        fontWeight: '600',
    });

    const isSuccess = error && error.startsWith("✅");

    return (
        <div className="flex flex-col min-h-screen font-['Inter'] bg-gray-100 text-gray-900">
            {/* HEADER */}
            <header className="h-16 bg-blue-800 text-white flex items-center justify-between px-6 shadow-xl z-20">
                <div className="text-xl font-extrabold tracking-wider flex items-center space-x-3">
                    <Phone size={24} className="text-blue-200" />
                    <span>AGENT DASHBOARD</span>
                </div>
                <div className="flex items-center space-x-6">
                    <span className="font-mono text-blue-300 text-sm">{currentTime}</span>
                    <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-sm font-semibold border-2 border-white/50 shadow-inner">JD</div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-8 gap-8 max-w-7xl mx-auto w-full">
                {/* LEFT PANEL: INTAKE FORM */}
                <div className="flex-1 min-w-[350px] max-w-full flex flex-col space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-2xl font-bold text-gray-800">📝 New Request Intake</h2>
                            <div className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-full text-sm font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm">
                                <span>✓ Verified Subscriber</span>
                            </div>
                        </div>
                        <div className="p-6 lg:p-8">
                            {error && <div style={getErrorBoxStyle(isSuccess)}>{error}</div>}
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
                                        className="w-full p-3 border border-blue-300 rounded-xl text-xl font-extrabold tracking-wide text-blue-700 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-inner"
                                    />
                                </div>

                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Category</label>
                                    <select 
                                        className="w-full p-3 border border-gray-300 rounded-xl text-base bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none shadow-sm"
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
                                        className="w-full p-3 border border-gray-300 rounded-xl text-base min-h-[120px] resize-y focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                                        placeholder="Type detailed notes about the customer's request here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 mt-2 shadow-lg hover:shadow-xl transform hover:scale-[1.005]
                                        ${isSaving ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-300/50'}`}
                                >
                                    {isSaving ? "Saving Log..." : "Save Request Log & Select Service"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: USER DETAILS & HISTORY */}
                <div className="w-full lg:w-[380px] min-w-[300px] flex flex-col space-y-6">
                    {/* CUSTOMER PROFILE CARD */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Customer Profile</h2>
                        </div>
                        <div className="p-6 divide-y divide-gray-100">
                            <div className="flex justify-between py-3 text-base">
                                <span className="text-gray-500">Phone Number</span>
                                <span className="font-bold text-gray-900">{callNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-3 text-base">
                                <span className="text-gray-500">Status</span>
                                <span className="font-bold text-green-600">Active</span>
                            </div>
                            <div className="flex justify-between py-3 text-base">
                                <span className="text-gray-500">Member Since</span>
                                <span className="font-semibold text-gray-900">Jan 2024</span>
                            </div>
                            <div className="flex justify-between py-3 text-base border-b-0">
                                <span className="text-gray-500">Current Plan</span>
                                <span className="font-semibold text-gray-900">Premium</span>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY CARD */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Recent History</h2>
                        </div>
                        <div className="p-6 divide-y divide-gray-100">
                            <div className="py-3 text-sm">
                                <div className="text-xs text-gray-400 mb-1">Today, 10:30 AM</div>
                                <div className="text-gray-700"><strong>System Check:</strong> Auto-verified subscription status via IVR.</div>
                            </div>
                            <div className="py-3 text-sm">
                                <div className="text-xs text-gray-400 mb-1">Yesterday</div>
                                <div className="text-gray-700"><strong>Billing:</strong> Invoice #4492 generated.</div>
                            </div>
                            <div className="py-3 text-sm border-b-0">
                                <div className="text-xs text-gray-400 mb-1">2 days ago</div>
                                <div className="text-gray-700"><strong>Login:</strong> Successful web login.</div>
                            </div>
                            <div className="py-3 text-sm border-b-0">
                                <div className="text-xs text-gray-400 mb-1">4 days ago</div>
                                <div className="text-gray-700"><strong>Support:</strong> Opened ticket T-510 regarding slow service.</div>
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
        <div className="min-h-screen bg-gray-100">
            {currentPage === 'dashboard' ? (
                <UserDashboardPage onServiceRedirect={() => handleRedirect('service')} />
            ) : (
                <UserServicePage onGoBack={() => handleRedirect('dashboard')} />
            )}
        </div>
    );
}
