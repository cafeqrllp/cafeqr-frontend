import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'
import { formatTzDate } from '../utils/timezoneUtils'
import { FaCheckCircle, FaCrown, FaRocket, FaHeadset, FaCalendarCheck, FaExclamationCircle, FaArrowRight, FaShieldAlt } from 'react-icons/fa'

const loadRazorpayScript = () => new Promise((resolve, reject) => {
  if (typeof window === 'undefined') return reject(new Error('Browser checkout is unavailable'))
  if (window.Razorpay) return resolve(true)

  const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(true), { once: true })
    existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout')), { once: true })
    return
  }

  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.async = true
  script.onload = () => resolve(true)
  script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
  document.body.appendChild(script)
})

export default function SubscriptionPage() {
  const {
    isActive,
    subscriptionStatus,
    normalizedExpiryDate,
    isAuthenticated,
    loading: authLoading,
    email,
    fullName,
    clientName,
    updateSubscription,
    timezone,
    clientId,
    orgId
  } = useAuth()
  
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  // Onboarding/Billing Selection State
  const [includeBasePlan, setIncludeBasePlan] = useState(true)
  const [includeSetupService, setIncludeSetupService] = useState(false)
  const [selectedModules, setSelectedModules] = useState([])

  const moduleItems = [
    { id: 'KOT', name: 'Kitchen Order Ticket (KOT) Sachet', price: 500, desc: 'Send orders instantly to kitchen screens. Required branch-wise.' },
    { id: 'INVENTORY', name: 'Inventory & Purchase ERP Sachet', price: 1992, desc: 'Stock valuation, transfers, supplier orders, and waste logging.' },
    { id: 'CRM', name: 'Customer CRM & Loyalty Sachet', price: 990, desc: 'Track customer visits, loyalty points, and run sms campaigns.' },
    { id: 'CREDIT_LEDGER', name: 'Credit Ledger (Udhaar) Sachet', price: 492, desc: 'Keep track of digital tabs and credit customers.' }
  ]

  const fetchStatus = useCallback(async () => {
    try {
      setError(null)
      const response = await api.get('/api/v1/subscription/status')
      const data = response.data?.data
      if (data) {
        setStatus(data)
        updateSubscription(data.status, data.expiryDate, data.activeModules)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load subscription status')
    }
  }, [updateSubscription])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStatus()
    }
  }, [isAuthenticated, fetchStatus])

  // If the user already has an active base subscription, force includeBasePlan to false for upgrades
  const isPaidOrTrial = (status?.status || subscriptionStatus) === 'ACTIVE' || (status?.status || subscriptionStatus) === 'TRIAL'
  const isExpired = !isPaidOrTrial || (status && !status.active)

  useEffect(() => {
    if (status) {
      if (status.active && status.status === 'ACTIVE') {
        setIncludeBasePlan(false)
      } else {
        setIncludeBasePlan(true)
        // If expired or new, default setup fee to true to guarantee profitability
        setIncludeSetupService(true)
      }
    }
  }, [status])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const statusParam = params.get('status')
      const paymentId = params.get('payment_id')
      const errorMsg = params.get('message')

      if (statusParam === 'success') {
        alert('Payment successful. Your subscription is active.')
        router.replace('/subscription', undefined, { shallow: true })
        fetchStatus()
      } else if (statusParam === 'error') {
        setError(errorMsg || 'Payment failed. Please try again.')
        router.replace('/subscription', undefined, { shallow: true })
      }
    }
  }, [router, fetchStatus])

  const toggleModule = (id) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  // Calculate prices dynamically
  const basePrice = includeBasePlan ? 999 : 0
  const setupPrice = includeSetupService ? 1499 : 0
  
  // Calculate module proration if it is a mid-cycle upgrade
  const daysLeft = status?.daysLeft || 0
  const calculateModuleCost = (modulePrice) => {
    if (status?.active && !includeBasePlan) {
      // Prorate cost based on remaining days left in year
      return Math.max(1, Math.round((modulePrice / 365.0) * daysLeft))
    }
    return modulePrice
  }

  const modulesTotalCost = selectedModules.reduce((sum, id) => {
    const item = moduleItems.find(m => m.id === id)
    return sum + (item ? calculateModuleCost(item.price) : 0)
  }, 0)

  const grandTotalCost = basePrice + setupPrice + modulesTotalCost

  const handlePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      await loadRazorpayScript()
      const response = await api.post('/api/v1/subscription/create-payment', {
        includeBasePlan,
        includeSetupService,
        selectedModules,
        orgId
      })
      const payment = response.data?.data

      if (!payment?.orderId || !payment?.keyId) {
        throw new Error('Invalid payment order returned by server')
      }

      const isAndroidApp = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android';

      const options = {
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency || 'INR',
        name: 'CafeQR Subscription',
        description: 'Cafe QR Yearly Plan Checkout',
        order_id: payment.orderId,
        prefill: {
          name: fullName || clientName || 'CafeQR User',
          email: email || ''
        },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => setLoading(false)
        }
      }

      if (isAndroidApp) {
        options.webview_intent = true
        options.redirect = true
        const frontendUrl = window.location.origin + '/subscription'
        options.callback_url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/subscription/razorpay-callback-redirect/${clientId}?frontend_url=${encodeURIComponent(frontendUrl)}`
      } else {
        options.handler = async (razorpayResponse) => {
          try {
            const activateResponse = await api.post('/api/v1/subscription/activate', {
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature
            })
            const activated = activateResponse.data?.data
            if (activated) {
              setStatus(activated)
              updateSubscription(activated.status, activated.expiryDate, activated.activeModules)
            }
            alert('Payment successful. Your subscription is active.')
            router.replace('/dashboard')
          } catch (err) {
            setError(err.response?.data?.message || 'Payment succeeded, but subscription activation failed. Please contact support.')
          } finally {
            setLoading(false)
          }
        }
      }

      const checkout = new window.Razorpay(options)
      checkout.open()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed')
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="loader-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  const active = status ? status.active : isActive
  const currentStatus = (status?.status || subscriptionStatus || '').toUpperCase()
  const expiryDate = status?.expiryDate ? new Date(status.expiryDate) : normalizedExpiryDate
  const statusLabel = currentStatus === 'TRIAL' ? 'Free Trial Active' : active ? 'Pro Plan Active' : 'Subscription Expired'

  return (
    <DashboardLayout title="Subscription">
      <div className="subscription-wrapper">
        <div className="container">
          <header className="page-header">
            <span className="premium-label"><FaCrown /> BILLING CENTER</span>
            <h1>Manage Subscription & Modules</h1>
            <p>Design a custom, scalable billing package tailored to your exact restaurant needs.</p>
          </header>

          <main className="sub-layout">
            {/* Status Panel */}
            <section className="status-panel">
              <div className="glass-card status-card">
                <h3>Service Status</h3>
                <div className={`status-indicator ${active ? 'active' : 'expired'}`}>
                  <span className="pulse-dot"></span>
                  {statusLabel}
                </div>

                <div className="info-row">
                  <FaCalendarCheck className="icon" />
                  <div className="text">
                    <label>Valid Until</label>
                    <span>{expiryDate ? formatTzDate(expiryDate, timezone, { format: 'date', long: true }) : 'N/A'}</span>
                  </div>
                </div>

                {Number.isFinite(daysLeft) && active && (
                  <div className="info-row compact">
                    <FaCheckCircle className="icon" />
                    <div className="text">
                      <label>Days Remaining</label>
                      <span>{daysLeft} days</span>
                    </div>
                  </div>
                )}

                <div className="highlight-box">
                  <FaRocket className="rocket" />
                  <span>Yearly billing cycle active.</span>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <FaExclamationCircle />
                  <span>{error}</span>
                </div>
              )}

              <div className="support-card">
                <p>Questions about billing?</p>
                <a href="mailto:pnriyas50@gmail.com"><FaHeadset /> Reach Support</a>
              </div>
            </section>

            {/* Custom Billing Configurator */}
            <section className="pricing-panel">
              <div className="builder-card glass-card">
                <h2>Configure Plan</h2>
                <p className="builder-sub">Select your base plan and active sachet add-ons below.</p>

                {/* Base Plan Switcher */}
                <div className="option-section">
                  <div className="section-title">1. Base Subscription</div>
                  <div className="option-row">
                    <div className="option-detail">
                      <h4>Cafe QR Yearly Core License</h4>
                      <p>Access to self-ordering menu, staff dashboard, and priority reports.</p>
                    </div>
                    <div className="option-action">
                      <span className="price-tag">₹999/year</span>
                      <input 
                        type="checkbox" 
                        checked={includeBasePlan} 
                        onChange={(e) => {
                          if (active && status?.status === 'ACTIVE') {
                            setIncludeBasePlan(e.target.checked)
                          }
                        }}
                        disabled={active && status?.status === 'ACTIVE'}
                      />
                    </div>
                  </div>
                </div>

                {/* Setup Fee Switcher */}
                <div className="option-section">
                  <div className="section-title">2. White-Glove Setup Service</div>
                  <div className="option-row">
                    <div className="option-detail">
                      <h4>Menu Setup & Onboarding Assistance</h4>
                      <p>One-time setup fee. Excluded automatically for existing active clients.</p>
                    </div>
                    <div className="option-action">
                      <span className="price-tag">₹1,499 one-time</span>
                      <input 
                        type="checkbox" 
                        checked={includeSetupService} 
                        onChange={(e) => setIncludeSetupService(e.target.checked)}
                        disabled={active && status?.status === 'ACTIVE'}
                      />
                    </div>
                  </div>
                </div>

                {/* Module List (Sachet Purchases) */}
                <div className="option-section">
                  <div className="section-title">3. Explore Sachet Modules (Yearly)</div>
                  <div className="modules-grid">
                    {moduleItems.map(item => {
                      const isModuleBought = status?.activeModules?.includes(item.id)
                      const cost = calculateModuleCost(item.price)
                      const isProrated = active && !includeBasePlan

                      return (
                        <div key={item.id} className={`module-item ${selectedModules.includes(item.id) ? 'selected' : ''} ${isModuleBought ? 'disabled' : ''}`}>
                          <div className="module-info">
                            <span className="chk-label">
                              <input 
                                type="checkbox"
                                checked={selectedModules.includes(item.id) || isModuleBought}
                                onChange={() => toggleModule(item.id)}
                                disabled={isModuleBought}
                              />
                              <strong>{item.name}</strong>
                            </span>
                            <p>{item.desc}</p>
                          </div>
                          <div className="module-price">
                            {isModuleBought ? (
                              <span className="active-tag">Active</span>
                            ) : (
                              <>
                                <span className="cost">₹{cost}</span>
                                <span className="cycle">{isProrated ? `for ${daysLeft} days` : '/year'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Billing Summary & Checkout */}
                <div className="summary-box">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Base Core Plan</span>
                    <span>₹{basePrice}</span>
                  </div>
                  {includeSetupService && (
                    <div className="summary-row">
                      <span>Menu Setup Fee</span>
                      <span>₹{setupPrice}</span>
                    </div>
                  )}
                  {selectedModules.length > 0 && (
                    <div className="summary-row">
                      <span>Sachet Add-ons Total</span>
                      <span>₹{modulesTotalCost}</span>
                    </div>
                  )}
                  <div className="summary-row grand-total">
                    <span>Total Amount</span>
                    <span>₹{grandTotalCost}</span>
                  </div>

                  <button className="checkout-btn" onClick={handlePayment} disabled={loading}>
                    {loading ? 'PROCESSING ORDER...' : 'PROCEED TO SECURE CHECKOUT'}
                  </button>

                  <div className="gateway-assurance">
                    <FaShieldAlt /> 128-bit Encrypted Razorpay Gateway Security
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>

        <style jsx>{`
          .subscription-wrapper { padding: 40px 20px; font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; }
          .container { max-width: 1100px; margin: 0 auto; }
          .page-header { margin-bottom: 40px; text-align: center; }
          .premium-label { font-size: 11px; font-weight: 800; color: #f97316; letter-spacing: 2px; background: #fff7ed; padding: 6px 16px; border-radius: 100px; border: 1px solid #ffedd5; }
          h1 { font-family: 'Outfit', sans-serif; font-size: 38px; font-weight: 900; color: #0f172a; margin: 16px 0 8px; }
          .page-header p { font-size: 15px; color: #64748b; margin: 0; }
          
          .sub-layout { display: grid; grid-template-columns: 320px 1fr; gap: 32px; align-items: start; }
          
          .glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); padding: 28px; }
          .status-card h3 { font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0 0 16px; }
          .status-indicator { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 800; padding: 8px 16px; border-radius: 12px; margin-bottom: 24px; }
          .status-indicator.active { background: #ecfdf5; color: #059669; }
          .status-indicator.expired { background: #fef2f2; color: #dc2626; }
          .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: blink 1.5s infinite; }
          
          .info-row { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
          .info-row .icon { font-size: 18px; color: #64748b; }
          .info-row label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
          .info-row span { font-size: 14px; font-weight: 700; color: #334155; }
          
          .highlight-box { display: flex; align-items: center; gap: 10px; padding: 14px; background: #f8fafc; border-radius: 16px; font-size: 12px; font-weight: 700; color: #64748b; margin-top: 10px; }
          .highlight-box .rocket { color: #f97316; }
          
          .support-card { text-align: center; margin-top: 20px; padding: 20px; border-radius: 20px; background: #fff7ed; border: 1px solid #ffedd5; }
          .support-card p { font-size: 13px; color: #ea580c; font-weight: 700; margin: 0 0 12px; }
          .support-card a { display: inline-flex; align-items: center; gap: 8px; background: white; color: #ea580c; font-size: 13px; font-weight: 800; text-decoration: none; padding: 8px 18px; border-radius: 10px; border: 1px solid #ffedd5; box-shadow: 0 4px 10px rgba(249,115,22,0.05); }

          /* Plan Configurator Styles */
          .builder-card { padding: 36px; }
          .builder-card h2 { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
          .builder-sub { font-size: 14px; color: #64748b; margin: 0 0 32px; }
          
          .option-section { margin-bottom: 32px; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; }
          .section-title { font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.5px; }
          .option-row { display: flex; justify-content: space-between; align-items: center; gap: 20px; background: #f8fafc; padding: 20px 24px; border-radius: 16px; border: 1px solid #e2e8f0; }
          .option-detail h4 { font-size: 15px; font-weight: 800; color: #1e293b; margin: 0 0 4px; }
          .option-detail p { font-size: 13px; color: #64748b; margin: 0; }
          .option-action { display: flex; align-items: center; gap: 18px; }
          .price-tag { font-size: 15px; font-weight: 800; color: #0f172a; }
          .option-action input[type="checkbox"] { width: 20px; height: 20px; accent-color: #f97316; cursor: pointer; }

          .modules-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
          .module-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; transition: all 0.2s; }
          .module-item:hover { border-color: #cbd5e1; background: #fafafa; }
          .module-item.selected { border-color: #f97316; background: #fff7ed; }
          .module-item.disabled { opacity: 0.6; background: #f8fafc; border-color: #e2e8f0; cursor: not-allowed; }
          
          .module-info { display: flex; flex-direction: column; gap: 4px; }
          .chk-label { display: flex; align-items: center; gap: 12px; font-size: 14px; color: #1e293b; }
          .chk-label input { width: 16px; height: 16px; accent-color: #f97316; }
          .module-info p { font-size: 12px; color: #64748b; margin: 0 0 0 28px; }
          
          .module-price { text-align: right; min-width: 100px; }
          .module-price .cost { display: block; font-size: 16px; font-weight: 850; color: #0f172a; }
          .module-price .cycle { font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
          .active-tag { display: inline-block; font-size: 11px; font-weight: 800; color: #059669; background: #ecfdf5; padding: 4px 10px; border-radius: 100px; }

          .error-box { margin-top: 16px; padding: 12px; border-radius: 10px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; }

          /* Summary & Checkout box */
          .summary-box { background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0; padding: 24px; margin-top: 40px; }
          .summary-box h3 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; font-weight: 600; margin-bottom: 10px; }
          .summary-row.grand-total { font-size: 18px; font-weight: 850; color: #0f172a; padding-top: 14px; border-top: 1px solid #e2e8f0; margin-top: 12px; }
          
          .checkout-btn { width: 100%; padding: 18px; background: #f97316; color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 6px 16px rgba(249, 115, 22, 0.15); margin-top: 20px; }
          .checkout-btn:hover { background: #ea580c; transform: translateY(-1.5px); box-shadow: 0 8px 24px rgba(249, 115, 22, 0.25); }
          .gateway-assurance { text-align: center; font-size: 10px; color: #94a3b8; font-weight: 700; margin: 14px 0 0; display: flex; align-items: center; justify-content: center; gap: 6px; }

          @keyframes blink { 50% { opacity: 0.6; } }
          
          @media (max-width: 900px) {
             .sub-layout { grid-template-columns: 1fr; }
             h1 { font-size: 32px; }
          }
          @media (max-width: 640px) {
             .setup-options { grid-template-columns: 1fr; }
             .builder-card { padding: 20px; }
          }
          @media (max-width: 480px) {
             .module-item { flex-direction: column; align-items: flex-start; gap: 10px; }
             .module-price { text-align: left; min-width: auto; }
             .builder-card { padding: 16px 12px; }
             h1 { font-size: 26px; }
             .container { padding: 0 8px; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  )
}
