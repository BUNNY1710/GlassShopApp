import { useState, useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import dashboardBg from "../assets/dashboard-bg.jpg";
import {
  getQuotations,
  getInvoices,
  createInvoiceFromQuotation,
  addPayment,
  getInvoiceById,
  getQuotationById,
  downloadTransportChallan,
  printDeliveryChallan,
  downloadInvoice,
  downloadBasicInvoice,
  printInvoice,
  printBasicInvoice,
} from "../api/quotationApi";
import "../styles/design-system.css";

function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedQuotationDetails, setSelectedQuotationDetails] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [convertForm, setConvertForm] = useState({
    invoiceType: "FINAL",
    invoiceDate: new Date().toISOString().split("T")[0],
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentType: "MANUAL", // FULL, HALF, MANUAL
    paymentMode: "CASH",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    bankName: "",
    chequeNumber: "",
    transactionId: "",
    notes: "",
  });
  const [currentInvoiceForPayment, setCurrentInvoiceForPayment] = useState(null);

  useEffect(() => {
    loadInvoices();
    loadConfirmedQuotations();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await getInvoices();
      setInvoices(response.data);
    } catch (error) {
      setMessage("❌ Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const loadConfirmedQuotations = async () => {
    try {
      const response = await getQuotations();
      const confirmed = response.data.filter((q) => q.status === "CONFIRMED");
      setQuotations(confirmed);
      if (confirmed.length === 0) {
        setMessage("ℹ️ No confirmed quotations available. Please confirm a quotation first.");
      }
    } catch (error) {
      console.error("Failed to load quotations", error);
      setMessage("❌ Failed to load quotations");
    }
  };

  const handleConvertToInvoice = async () => {
    if (!selectedQuotation) {
      setMessage("❌ Please select a quotation");
      return;
    }

    try {
      const response = await createInvoiceFromQuotation({
        quotationId: selectedQuotation.id,
        invoiceType: convertForm.invoiceType,
        invoiceDate: convertForm.invoiceDate,
      });
      setMessage("✅ Invoice created successfully");
      setShowConvertModal(false);
      setSelectedQuotation(null);
      setConvertForm({
        invoiceType: "FINAL",
        invoiceDate: new Date().toISOString().split("T")[0],
      });
      loadInvoices();
      loadConfirmedQuotations();
    } catch (error) {
      console.error("Invoice creation error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create invoice";
      setMessage(`❌ ${errorMessage}`);
    }
  };

  const handleAddPayment = async () => {
    if (!currentInvoiceId) return;

    try {
      await addPayment(currentInvoiceId, {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
        paymentDate: new Date(paymentForm.paymentDate).toISOString(),
      });
      setMessage("✅ Payment added successfully");
      setShowPaymentModal(false);
      setCurrentInvoiceId(null);
      resetPaymentForm();
      loadInvoices();
    } catch (error) {
      setMessage("❌ Failed to add payment");
    }
  };

  const handleViewInvoice = async (id) => {
    try {
      const response = await getInvoiceById(id);
      setSelectedInvoice(response.data);
      // Load quotation details if available
      if (response.data.quotationId) {
        try {
          const quotationResponse = await getQuotationById(response.data.quotationId);
          setSelectedQuotationDetails(quotationResponse.data);
        } catch (err) {
          console.error("Failed to load quotation details", err);
        }
      }
    } catch (error) {
      setMessage("❌ Failed to load invoice details");
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      paymentType: "MANUAL",
      paymentMode: "CASH",
      amount: "",
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNumber: "",
      bankName: "",
      chequeNumber: "",
      transactionId: "",
      notes: "",
    });
    setCurrentInvoiceForPayment(null);
  };

  const handlePaymentTypeChange = (paymentType) => {
    if (!currentInvoiceForPayment) return;
    
    let amount = "";
    if (paymentType === "FULL") {
      amount = currentInvoiceForPayment.dueAmount || currentInvoiceForPayment.grandTotal || 0;
    } else if (paymentType === "HALF") {
      amount = (currentInvoiceForPayment.dueAmount || currentInvoiceForPayment.grandTotal || 0) / 2;
    }
    
    setPaymentForm({
      ...paymentForm,
      paymentType,
      amount: amount.toString(),
    });
  };

  const getPaymentStatusBadge = (status) => {
    const colors = {
      PAID: "#4caf50",
      PARTIAL: "#ff9800",
      DUE: "#f44336",
    };
    return (
      <span
        style={{
          padding: "4px 8px",
          borderRadius: "4px",
          backgroundColor: colors[status] || "#757575",
          color: "white",
          fontSize: "12px",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <PageWrapper backgroundImage={dashboardBg}>
      <div style={{ padding: isMobile ? "15px" : "20px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "25px", padding: "20px", backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
          <h1 style={{ color: "#fff", marginBottom: "8px", fontSize: isMobile ? "26px" : "32px", fontWeight: "800", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}>
            🧾 Invoice & Billing Management
          </h1>
          <p style={{ color: "#fff", fontSize: "15px", margin: 0, fontWeight: "500", textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}>
            Manage invoices, payments, and convert confirmed quotations to invoices
          </p>
        </div>

        {message && (
          <div
            style={{
              padding: "10px",
              marginBottom: "20px",
              backgroundColor: message.includes("✅") ? "#4caf50" : "#f44336",
              color: "white",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}

        <div style={{ marginBottom: "20px", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
          <button
            onClick={() => {
              setShowConvertModal(true);
              loadConfirmedQuotations();
            }}
            style={{
              padding: "12px 24px",
              backgroundColor: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 6px -1px rgba(34, 197, 94, 0.3)",
              transition: "all 0.2s",
              width: isMobile ? "100%" : "auto",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#16a34a";
              e.target.style.boxShadow = "0 6px 8px -1px rgba(34, 197, 94, 0.4)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#22c55e";
              e.target.style.boxShadow = "0 4px 6px -1px rgba(34, 197, 94, 0.3)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            ➕ Convert Quotation to Invoice
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#fff", padding: "20px" }}>Loading...</div>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Invoice #</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Customer</th>
                    {!isMobile && (
                      <>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Type</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Billing Type</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Payment Status</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Grand Total</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Paid</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Due</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Date</th>
                      </>
                    )}
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, idx) => (
                    <tr
                      key={invoice.id}
                      style={{
                        borderTop: "1px solid #ddd",
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#f9fafb")}
                    >
                      <td style={{ padding: "12px", fontWeight: "500" }}>{invoice.invoiceNumber}</td>
                      <td style={{ padding: "12px" }}>{invoice.customerName}</td>
                      {!isMobile && (
                        <>
                          <td style={{ padding: "12px" }}>{invoice.invoiceType}</td>
                          <td style={{ padding: "12px" }}>{invoice.billingType}</td>
                          <td style={{ padding: "12px" }}>{getPaymentStatusBadge(invoice.paymentStatus)}</td>
                          <td style={{ padding: "12px", fontWeight: "600" }}>₹{invoice.grandTotal?.toFixed(2)}</td>
                          <td style={{ padding: "12px" }}>₹{invoice.paidAmount?.toFixed(2)}</td>
                          <td style={{ padding: "12px", color: invoice.dueAmount > 0 ? "#ef4444" : "#22c55e", fontWeight: "500" }}>
                            ₹{invoice.dueAmount?.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px" }}>{invoice.invoiceDate}</td>
                        </>
                      )}
                      <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => handleViewInvoice(invoice.id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#2196f3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "5px",
                        }}
                      >
                        View
                      </button>
                      {invoice.paymentStatus !== "PAID" && (
                        <button
                          onClick={async () => {
                            setCurrentInvoiceId(invoice.id);
                            setCurrentInvoiceForPayment(invoice);
                            // Load full invoice details
                            try {
                              const response = await getInvoiceById(invoice.id);
                              setCurrentInvoiceForPayment(response.data);
                            } catch (error) {
                              console.error("Failed to load invoice details", error);
                            }
                            setShowPaymentModal(true);
                          }}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          💳 Add Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {invoices.length === 0 && (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "#6b7280" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }}>🧾</div>
                <p style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>No invoices found</p>
                <p style={{ fontSize: "14px", color: "#9ca3af" }}>Convert a confirmed quotation to create your first invoice</p>
              </div>
            )}
          </div>
        )}

        {/* Convert Quotation Modal */}
        {showConvertModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10004,
              paddingTop: "80px",
            }}
            onClick={() => {
              setShowConvertModal(false);
              setSelectedQuotation(null);
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "20px" : "30px",
                borderRadius: "16px",
                maxWidth: "700px",
                width: "100%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
                zIndex: 10005,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: "25px", borderBottom: "2px solid #e5e7eb", paddingBottom: "15px" }}>
                <h2 style={{ margin: 0, color: "#1f2937", fontSize: isMobile ? "20px" : "24px", fontWeight: "600" }}>🔄 Convert Quotation to Invoice</h2>
                <p style={{ margin: "5px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Select a confirmed quotation to create an invoice</p>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                  Select Quotation * <span style={{ color: "#ef4444" }}>●</span>
                </label>
                <select
                  value={selectedQuotation?.id || ""}
                  onChange={(e) => {
                    const quotation = quotations.find((q) => q.id === parseInt(e.target.value));
                    setSelectedQuotation(quotation);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">🔍 Select a confirmed quotation...</option>
                  {quotations.length === 0 ? (
                    <option value="" disabled>No confirmed quotations available</option>
                  ) : (
                    quotations.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quotationNumber} - {q.customerName} - ₹{q.grandTotal?.toFixed(2)}
                      </option>
                    ))
                  )}
                </select>
                {quotations.length === 0 && (
                  <p style={{ marginTop: "8px", color: "#f59e0b", fontSize: "12px" }}>
                    ⚠️ No confirmed quotations found. Please confirm a quotation first in the Quotations page.
                  </p>
                )}
              </div>
              {selectedQuotation && (
                <>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                      Invoice Type * <span style={{ color: "#ef4444" }}>●</span>
                    </label>
                    <select
                      value={convertForm.invoiceType}
                      onChange={(e) => setConvertForm({ ...convertForm, invoiceType: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    >
                      <option value="ADVANCE">Advance Bill</option>
                      <option value="FINAL">Final Bill</option>
                    </select>
                    <p style={{ marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>💡 Select invoice type</p>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                      Invoice Date * <span style={{ color: "#ef4444" }}>●</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={convertForm.invoiceDate}
                      onChange={(e) => setConvertForm({ ...convertForm, invoiceDate: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                    <p style={{ marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>📅 Date for the invoice</p>
                  </div>
                  <div
                    style={{
                      marginBottom: "20px",
                      padding: "20px",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "10px",
                      border: "2px solid #bae6fd",
                    }}
                  >
                    <h4 style={{ margin: "0 0 12px 0", color: "#1e40af", fontSize: "16px", fontWeight: "600" }}>📄 Selected Quotation</h4>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Quotation Number</div>
                        <div style={{ fontSize: "15px", color: "#1f2937", fontWeight: "600" }}>{selectedQuotation.quotationNumber}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Customer</div>
                        <div style={{ fontSize: "15px", color: "#1f2937", fontWeight: "600" }}>{selectedQuotation.customerName}</div>
                      </div>
                      <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Grand Total</div>
                        <div style={{ fontSize: "20px", color: "#1e40af", fontWeight: "700" }}>₹{selectedQuotation.grandTotal?.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px", paddingTop: "20px", borderTop: "2px solid #e5e7eb" }}>
                <button
                  onClick={handleConvertToInvoice}
                  disabled={!selectedQuotation}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    backgroundColor: selectedQuotation ? "#22c55e" : "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: selectedQuotation ? "pointer" : "not-allowed",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    boxShadow: selectedQuotation ? "0 4px 6px -1px rgba(34, 197, 94, 0.3)" : "none",
                  }}
                  onMouseOver={(e) => {
                    if (selectedQuotation) {
                      e.target.style.backgroundColor = "#16a34a";
                      e.target.style.boxShadow = "0 6px 8px -1px rgba(34, 197, 94, 0.4)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedQuotation) {
                      e.target.style.backgroundColor = "#22c55e";
                      e.target.style.boxShadow = "0 4px 6px -1px rgba(34, 197, 94, 0.3)";
                    }
                  }}
                >
                  ✅ Convert to Invoice
                </button>
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    setSelectedQuotation(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px 24px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#4b5563")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#6b7280")}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && currentInvoiceForPayment && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10004,
              paddingTop: "80px",
              padding: isMobile ? "80px 15px 15px 15px" : "80px 20px 20px 20px",
            }}
            onClick={() => {
              setShowPaymentModal(false);
              setCurrentInvoiceId(null);
              resetPaymentForm();
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "20px" : "35px",
                borderRadius: "16px",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "calc(100vh - 100px)",
                overflow: "auto",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
                zIndex: 10005,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: "25px", borderBottom: "3px solid #e5e7eb", paddingBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <h2 style={{ margin: 0, color: "#1f2937", fontSize: isMobile ? "22px" : "28px", fontWeight: "700" }}>
                      💳 Add Payment
                    </h2>
                    <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
                      Record payment for Invoice #{currentInvoiceForPayment.invoiceNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setCurrentInvoiceId(null);
                      resetPaymentForm();
                    }}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#dc2626")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#ef4444")}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Invoice Summary */}
              <div
                style={{
                  marginBottom: "25px",
                  padding: "20px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "12px",
                  border: "2px solid #bae6fd",
                }}
              >
                <h3 style={{ margin: "0 0 15px 0", color: "#1e40af", fontSize: "18px", fontWeight: "600" }}>📄 Invoice Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "15px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px", fontWeight: "500" }}>Grand Total</div>
                    <div style={{ fontSize: "20px", color: "#1e40af", fontWeight: "700" }}>₹{currentInvoiceForPayment.grandTotal?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px", fontWeight: "500" }}>Already Paid</div>
                    <div style={{ fontSize: "18px", color: "#22c55e", fontWeight: "600" }}>₹{currentInvoiceForPayment.paidAmount?.toFixed(2)}</div>
                  </div>
                  <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px", fontWeight: "500" }}>Due Amount</div>
                    <div
                      style={{
                        fontSize: "24px",
                        color: currentInvoiceForPayment.dueAmount > 0 ? "#ef4444" : "#22c55e",
                        fontWeight: "800",
                      }}
                    >
                      ₹{currentInvoiceForPayment.dueAmount?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "12px", color: "#374151", fontWeight: "600", fontSize: "15px" }}>
                  Payment Type * <span style={{ color: "#ef4444" }}>●</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => handlePaymentTypeChange("FULL")}
                    style={{
                      padding: "15px",
                      borderRadius: "10px",
                      border: paymentForm.paymentType === "FULL" ? "3px solid #22c55e" : "2px solid #d1d5db",
                      backgroundColor: paymentForm.paymentType === "FULL" ? "#dcfce7" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseOver={(e) => {
                      if (paymentForm.paymentType !== "FULL") {
                        e.currentTarget.style.borderColor = "#22c55e";
                        e.currentTarget.style.backgroundColor = "#f0fdf4";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (paymentForm.paymentType !== "FULL") {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>💯</div>
                    <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "14px" }}>Full Payment</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                      ₹{currentInvoiceForPayment.dueAmount?.toFixed(2)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentTypeChange("HALF")}
                    style={{
                      padding: "15px",
                      borderRadius: "10px",
                      border: paymentForm.paymentType === "HALF" ? "3px solid #f59e0b" : "2px solid #d1d5db",
                      backgroundColor: paymentForm.paymentType === "HALF" ? "#fef3c7" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseOver={(e) => {
                      if (paymentForm.paymentType !== "HALF") {
                        e.currentTarget.style.borderColor = "#f59e0b";
                        e.currentTarget.style.backgroundColor = "#fffbeb";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (paymentForm.paymentType !== "HALF") {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>➗</div>
                    <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "14px" }}>Half Payment</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                      ₹{((currentInvoiceForPayment.dueAmount || 0) / 2).toFixed(2)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentTypeChange("MANUAL")}
                    style={{
                      padding: "15px",
                      borderRadius: "10px",
                      border: paymentForm.paymentType === "MANUAL" ? "3px solid #6366f1" : "2px solid #d1d5db",
                      backgroundColor: paymentForm.paymentType === "MANUAL" ? "#eef2ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseOver={(e) => {
                      if (paymentForm.paymentType !== "MANUAL") {
                        e.currentTarget.style.borderColor = "#6366f1";
                        e.currentTarget.style.backgroundColor = "#f5f7ff";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (paymentForm.paymentType !== "MANUAL") {
                        e.currentTarget.style.borderColor = "#d1d5db";
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>✏️</div>
                    <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "14px" }}>Manual Amount</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Enter custom</div>
                  </button>
                </div>
              </div>

              {/* Payment Details Form */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                    Payment Amount (₹) * <span style={{ color: "#ef4444" }}>●</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    max={currentInvoiceForPayment.dueAmount || currentInvoiceForPayment.grandTotal}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value, paymentType: "MANUAL" })}
                    placeholder="0.00"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "16px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <p style={{ marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>
                    💰 Maximum: ₹{currentInvoiceForPayment.dueAmount?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                    Payment Date * <span style={{ color: "#ef4444" }}>●</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <p style={{ marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>📅 Date of payment</p>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                    Payment Mode * <span style={{ color: "#ef4444" }}>●</span>
                  </label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  >
                    <option value="CASH">💵 Cash</option>
                    <option value="UPI">📱 UPI</option>
                    <option value="BANK">🏦 Bank Transfer</option>
                    <option value="SPLIT">💳 Split Payment</option>
                  </select>
                  <p style={{ marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>💳 Payment method</p>
                </div>
              </div>

              {/* Conditional Fields */}
              {paymentForm.paymentMode === "BANK" && (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                      placeholder="e.g., State Bank of India"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      value={paymentForm.chequeNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, chequeNumber: e.target.value })}
                      placeholder="e.g., 123456"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                    />
                  </div>
                </div>
              )}
              {(paymentForm.paymentMode === "UPI" || paymentForm.paymentMode === "BANK") && (
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                    Transaction ID / Reference Number
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    placeholder="Enter transaction or reference number"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      transition: "all 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  <p style={{ marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>🔗 UPI transaction ID or bank reference number</p>
                </div>
              )}
              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "14px" }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Add any additional notes about this payment..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    minHeight: "100px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
                <p style={{ marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>📝 Additional payment notes or remarks</p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px", paddingTop: "20px", borderTop: "2px solid #e5e7eb" }}>
                <button
                  onClick={handleAddPayment}
                  disabled={!paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    backgroundColor: paymentForm.amount && parseFloat(paymentForm.amount) > 0 ? "#22c55e" : "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: paymentForm.amount && parseFloat(paymentForm.amount) > 0 ? "pointer" : "not-allowed",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    boxShadow: paymentForm.amount && parseFloat(paymentForm.amount) > 0 ? "0 4px 6px -1px rgba(34, 197, 94, 0.3)" : "none",
                  }}
                  onMouseOver={(e) => {
                    if (paymentForm.amount && parseFloat(paymentForm.amount) > 0) {
                      e.target.style.backgroundColor = "#16a34a";
                      e.target.style.boxShadow = "0 6px 8px -1px rgba(34, 197, 94, 0.4)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (paymentForm.amount && parseFloat(paymentForm.amount) > 0) {
                      e.target.style.backgroundColor = "#22c55e";
                      e.target.style.boxShadow = "0 4px 6px -1px rgba(34, 197, 94, 0.3)";
                    }
                  }}
                >
                  ✅ Add Payment
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setCurrentInvoiceId(null);
                    resetPaymentForm();
                  }}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#4b5563")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#6b7280")}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Details Modal */}
        {selectedInvoice && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10004,
              padding: isMobile ? "80px 15px 15px 15px" : "80px 20px 20px 20px",
            }}
            onClick={() => setSelectedInvoice(null)}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: isMobile ? "20px" : "30px",
                borderRadius: "16px",
                maxWidth: "900px",
                width: "100%",
                maxHeight: "calc(100vh - 100px)",
                overflow: "auto",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
                zIndex: 10005,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: "25px", borderBottom: "2px solid #e5e7eb", paddingBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <h2 style={{ margin: 0, color: "#1f2937", fontSize: "24px", fontWeight: "600" }}>🧾 Invoice Details</h2>
                    <p style={{ margin: "5px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Complete invoice information and related quotation</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      onClick={async () => {
                        try {
                          const response = await downloadInvoice(selectedInvoice.id);
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `invoice-${selectedInvoice.invoiceNumber}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Failed to download invoice", error);
                          alert("Failed to download invoice PDF");
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6366f1",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#4f46e5")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#6366f1")}
                    >
                      📄 Download Final Bill
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await printInvoice(selectedInvoice.id);
                          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                          const printWindow = window.open(url, '_blank');
                          if (printWindow) {
                            printWindow.onload = () => {
                              printWindow.print();
                            };
                          }
                        } catch (error) {
                          console.error("Failed to print invoice", error);
                          alert("Failed to print invoice PDF");
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#d97706")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#f59e0b")}
                    >
                      🖨️ Print Final Bill
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await downloadBasicInvoice(selectedInvoice.id);
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `basic-invoice-${selectedInvoice.invoiceNumber}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Failed to download estimate bill", error);
                          alert("Failed to download estimate bill PDF");
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#7c3aed")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#8b5cf6")}
                    >
                      📋 Download Estimate Bill
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await printBasicInvoice(selectedInvoice.id);
                          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                          const printWindow = window.open(url, '_blank');
                          if (printWindow) {
                            printWindow.onload = () => {
                              printWindow.print();
                            };
                          }
                        } catch (error) {
                          console.error("Failed to print estimate bill", error);
                          alert("Failed to print estimate bill PDF");
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#a855f7",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#9333ea")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#a855f7")}
                    >
                      🖨️ Print Estimate Bill
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await printDeliveryChallan(selectedInvoice.id);
                          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                          const printWindow = window.open(url, '_blank');
                          if (printWindow) {
                            printWindow.onload = () => {
                              printWindow.print();
                            };
                          }
                        } catch (error) {
                          console.error("Failed to print delivery challan", error);
                          alert("Failed to print delivery challan PDF");
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#059669")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#10b981")}
                    >
                      🖨️ Print Challan (No Prices)
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const response = await downloadTransportChallan(selectedInvoice.id);
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `delivery-challan-${selectedInvoice.invoiceNumber}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("Failed to download transport challan", error);
                          alert("Failed to download delivery challan PDF");
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#2563eb")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#3b82f6")}
                    >
                      📥 Download Challan
                    </button>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#dc2626")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#ef4444")}
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotation Details Section */}
              {(selectedQuotationDetails || selectedInvoice.quotationId) && (
                <div
                  style={{
                    marginBottom: "30px",
                    padding: "20px",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "8px",
                    border: "2px solid #bae6fd",
                  }}
                >
                  <h3 style={{ margin: "0 0 15px 0", color: "#1e40af", fontSize: "18px", fontWeight: "600" }}>
                    📄 Related Quotation
                  </h3>
                  {selectedQuotationDetails ? (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
                      <div>
                        <strong style={{ color: "#374151", fontSize: "13px" }}>Quotation #:</strong>
                        <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px", fontWeight: "500" }}>
                          {selectedQuotationDetails.quotationNumber}
                        </p>
                      </div>
                      <div>
                        <strong style={{ color: "#374151", fontSize: "13px" }}>Quotation Date:</strong>
                        <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>{selectedQuotationDetails.quotationDate}</p>
                      </div>
                      <div>
                        <strong style={{ color: "#374151", fontSize: "13px" }}>Status:</strong>
                        <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>{selectedQuotationDetails.status}</p>
                      </div>
                      <div>
                        <strong style={{ color: "#374151", fontSize: "13px" }}>Quotation Total:</strong>
                        <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px", fontWeight: "600" }}>
                          ₹{selectedQuotationDetails.grandTotal?.toFixed(2)}
                        </p>
                      </div>
                      {selectedQuotationDetails.billingType && (
                        <div>
                          <strong style={{ color: "#374151", fontSize: "13px" }}>Billing Type:</strong>
                          <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>{selectedQuotationDetails.billingType}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: "15px", textAlign: "center", color: "#6b7280" }}>
                      <p style={{ margin: 0 }}>Loading quotation details...</p>
                      <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>Quotation ID: {selectedInvoice.quotationId}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Invoice Information */}
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#374151", fontSize: "18px", fontWeight: "600" }}>📋 Invoice Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "15px" }}>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Invoice #:</strong>
                    <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px", fontWeight: "500" }}>{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Customer:</strong>
                    <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Billing Type:</strong>
                    <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>{selectedInvoice.billingType}</p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Payment Status:</strong>
                    <p style={{ margin: "4px 0" }}>{getPaymentStatusBadge(selectedInvoice.paymentStatus)}</p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Invoice Date:</strong>
                    <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>{selectedInvoice.invoiceDate}</p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Invoice Type:</strong>
                    <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>{selectedInvoice.invoiceType}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#374151", fontSize: "18px", fontWeight: "600" }}>💰 Financial Summary</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "15px" }}>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Subtotal:</strong>
                    <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "16px", fontWeight: "500" }}>₹{selectedInvoice.subtotal?.toFixed(2)}</p>
                  </div>
                  {selectedInvoice.billingType === "GST" && (
                    <>
                      <div>
                        <strong style={{ color: "#374151", fontSize: "13px" }}>GST ({selectedInvoice.gstPercentage}%):</strong>
                        <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "16px", fontWeight: "500" }}>
                          ₹{selectedInvoice.gstAmount?.toFixed(2)}
                        </p>
                      </div>
                      {selectedInvoice.cgst && (
                        <div>
                          <strong style={{ color: "#374151", fontSize: "13px" }}>CGST:</strong>
                          <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>₹{selectedInvoice.cgst?.toFixed(2)}</p>
                        </div>
                      )}
                      {selectedInvoice.sgst && (
                        <div>
                          <strong style={{ color: "#374151", fontSize: "13px" }}>SGST:</strong>
                          <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>₹{selectedInvoice.sgst?.toFixed(2)}</p>
                        </div>
                      )}
                      {selectedInvoice.igst && (
                        <div>
                          <strong style={{ color: "#374151", fontSize: "13px" }}>IGST:</strong>
                          <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "14px" }}>₹{selectedInvoice.igst?.toFixed(2)}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Grand Total:</strong>
                    <p style={{ margin: "4px 0", color: "#1f2937", fontSize: "18px", fontWeight: "700" }}>
                      ₹{selectedInvoice.grandTotal?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Paid Amount:</strong>
                    <p style={{ margin: "4px 0", color: "#22c55e", fontSize: "16px", fontWeight: "600" }}>
                      ₹{selectedInvoice.paidAmount?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: "#374151", fontSize: "13px" }}>Due Amount:</strong>
                    <p
                      style={{
                        margin: "4px 0",
                        color: selectedInvoice.dueAmount > 0 ? "#ef4444" : "#22c55e",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      ₹{selectedInvoice.dueAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div style={{ marginBottom: "30px" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#374151", fontSize: "18px", fontWeight: "600" }}>📦 Invoice Items</h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f3f4f6" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Glass Type</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Size</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Qty</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Rate</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderTop: "1px solid #e5e7eb",
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                          }}
                        >
                          <td style={{ padding: "12px" }}>{item.glassType}</td>
                          <td style={{ padding: "12px" }}>
                            {item.height} x {item.width} ft
                          </td>
                          <td style={{ padding: "12px" }}>{item.quantity}</td>
                          <td style={{ padding: "12px" }}>₹{item.ratePerSqft}</td>
                          <td style={{ padding: "12px", fontWeight: "600" }}>₹{item.subtotal?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Section */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div style={{ marginBottom: "30px" }}>
                  <h3 style={{ margin: "0 0 15px 0", color: "#374151", fontSize: "18px", fontWeight: "600" }}>💳 Payment History</h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f3f4f6" }}>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Date</th>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Mode</th>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Amount</th>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "13px", fontWeight: "600" }}>Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.payments.map((payment, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderTop: "1px solid #e5e7eb",
                              backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                            }}
                          >
                            <td style={{ padding: "12px" }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                            <td style={{ padding: "12px" }}>{payment.paymentMode}</td>
                            <td style={{ padding: "12px", fontWeight: "600", color: "#22c55e" }}>₹{payment.amount?.toFixed(2)}</td>
                            <td style={{ padding: "12px", color: "#6b7280" }}>{payment.transactionId || payment.referenceNumber || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "20px", borderTop: "2px solid #e5e7eb" }}>
                <button
                  onClick={() => {
                    setSelectedInvoice(null);
                    setSelectedQuotationDetails(null);
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#4b5563")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#6b7280")}
                >
                  ❌ Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default InvoiceManagement;

