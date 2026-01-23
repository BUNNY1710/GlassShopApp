package com.glassshop.ai.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.glassshop.ai.entity.Invoice;
import com.glassshop.ai.entity.Quotation;
import com.glassshop.ai.entity.Shop;
import com.glassshop.ai.entity.User;
import com.glassshop.ai.repository.InvoiceRepository;
import com.glassshop.ai.repository.QuotationRepository;
import com.glassshop.ai.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class PdfService {

    @Autowired
    private QuotationRepository quotationRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    private Shop getCurrentShop() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("User not authenticated");
        }
        String username = auth.getName();
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shop shop = user.getShop();
        if (shop == null) {
            throw new RuntimeException("Shop not found");
        }
        return shop;
    }

    /**
     * Generate PDF for Quotation/Cutting-Pad
     */
    public byte[] generateQuotationPdf(Long quotationId) throws IOException {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        
        Shop shop = getCurrentShop();
        if (!quotation.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized access to quotation");
        }

        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);

        float margin = 50;
        float yPosition = 750;
        float lineHeight = 20;
        float currentY = yPosition;

        // Title
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("QUOTATION / CUTTING-PAD");
        contentStream.endText();
        currentY -= lineHeight * 2;

        // Shop Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("From:");
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        if (shop.getShopName() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText(shop.getShopName());
            contentStream.endText();
            currentY -= lineHeight;
        }
        if (shop.getOwnerName() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Owner: " + shop.getOwnerName());
            contentStream.endText();
            currentY -= lineHeight;
        }
        if (shop.getEmail() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Email: " + shop.getEmail());
            contentStream.endText();
            currentY -= lineHeight;
        }
        if (shop.getWhatsappNumber() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + shop.getWhatsappNumber());
            contentStream.endText();
            currentY -= lineHeight;
        }

        currentY -= lineHeight;

        // Customer Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("To:");
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText(quotation.getCustomerName());
        contentStream.endText();
        currentY -= lineHeight;

        if (quotation.getCustomerMobile() != null && !quotation.getCustomerMobile().isEmpty()) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + quotation.getCustomerMobile());
            contentStream.endText();
            currentY -= lineHeight;
        }

        if (quotation.getCustomerAddress() != null && !quotation.getCustomerAddress().isEmpty()) {
            String[] addressLines = quotation.getCustomerAddress().split("\n");
            for (String line : addressLines) {
                if (currentY < 100) {
                    contentStream.close();
                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    currentY = 750;
                }
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText(line);
                contentStream.endText();
                currentY -= lineHeight;
            }
        }

        if (quotation.getCustomerGstin() != null && !quotation.getCustomerGstin().isEmpty()) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("GSTIN: " + quotation.getCustomerGstin());
            contentStream.endText();
            currentY -= lineHeight;
        }

        currentY -= lineHeight;

        // Quotation Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("Quotation Number: " + quotation.getQuotationNumber());
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("Date: " + quotation.getQuotationDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        contentStream.endText();
        currentY -= lineHeight;

        if (quotation.getValidUntil() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Valid Until: " + quotation.getValidUntil().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
            contentStream.endText();
            currentY -= lineHeight;
        }

        currentY -= lineHeight;

        // Items Table Header
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        float tableY = currentY;
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("Item");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 150, tableY);
        contentStream.showText("Size");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 250, tableY);
        contentStream.showText("Qty");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 300, tableY);
        contentStream.showText("Rate");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 400, tableY);
        contentStream.showText("Amount");
        contentStream.endText();
        tableY -= lineHeight;

        // Draw line
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + 500, tableY);
        contentStream.stroke();
        tableY -= 5;

        // Items
        contentStream.setFont(PDType1Font.HELVETICA, 9);
        for (var item : quotation.getItems()) {
            if (tableY < 100) {
                contentStream.close();
                page = new PDPage(PDRectangle.A4);
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                tableY = 750;
            }

            String itemDesc = item.getGlassType() != null ? item.getGlassType() : "";
            if (item.getThickness() != null) {
                itemDesc += " (" + item.getThickness() + "mm)";
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(margin, tableY);
            contentStream.showText(itemDesc);
            contentStream.endText();

            String size = "";
            if (item.getHeight() != null && item.getWidth() != null) {
                size = String.format("%.2f", item.getHeight()) + " × " + String.format("%.2f", item.getWidth());
                if (item.getHeightUnit() != null) {
                    size += " " + item.getHeightUnit();
                }
            }
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 150, tableY);
            contentStream.showText(size);
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 250, tableY);
            contentStream.showText(String.valueOf(item.getQuantity()));
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 300, tableY);
            contentStream.showText(String.format("%.2f", item.getRatePerSqft() != null ? item.getRatePerSqft() : 0.0));
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 400, tableY);
            contentStream.showText(String.format("%.2f", item.getSubtotal() != null ? item.getSubtotal() : 0.0));
            contentStream.endText();

            tableY -= lineHeight;
        }

        tableY -= lineHeight;
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + 500, tableY);
        contentStream.stroke();
        tableY -= lineHeight;

        // Totals
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 300, tableY);
        contentStream.showText("Subtotal:");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 400, tableY);
        contentStream.showText(String.format("%.2f", quotation.getSubtotal() != null ? quotation.getSubtotal() : 0.0));
        contentStream.endText();
        tableY -= lineHeight;

        if (quotation.getInstallationCharge() != null && quotation.getInstallationCharge() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 300, tableY);
            contentStream.showText("Installation:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 400, tableY);
            contentStream.showText(String.format("%.2f", quotation.getInstallationCharge()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (quotation.getTransportCharge() != null && quotation.getTransportCharge() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 300, tableY);
            contentStream.showText("Transport:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 400, tableY);
            contentStream.showText(String.format("%.2f", quotation.getTransportCharge()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (quotation.getDiscount() != null && quotation.getDiscount() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 300, tableY);
            contentStream.showText("Discount:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 400, tableY);
            contentStream.showText("-" + String.format("%.2f", quotation.getDiscount()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (quotation.getBillingType().toString().equals("GST") && quotation.getGstAmount() != null && quotation.getGstAmount() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 300, tableY);
            contentStream.showText("GST (" + (quotation.getGstPercentage() != null ? quotation.getGstPercentage() : 0) + "%):");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 400, tableY);
            contentStream.showText(String.format("%.2f", quotation.getGstAmount()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        tableY -= lineHeight;
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 300, tableY);
        contentStream.showText("Grand Total:");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 400, tableY);
        contentStream.showText("Rs. " + String.format("%.2f", quotation.getGrandTotal() != null ? quotation.getGrandTotal() : 0.0));
        contentStream.endText();

        contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();

        return baos.toByteArray();
    }

    /**
     * Generate PDF for Delivery Challan
     */
    public byte[] generateTransportChallanPdf(Long invoiceId) throws IOException {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        Shop shop = getCurrentShop();
        if (!invoice.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized access to invoice");
        }

        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);

        float margin = 50;
        float yPosition = 750;
        float lineHeight = 20;
        float currentY = yPosition;

        // Title
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 24);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("DELIVERY CHALLAN");
        contentStream.endText();
        currentY -= lineHeight * 2;

        // Invoice/Challan Number
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("Challan No: " + invoice.getInvoiceNumber());
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("Date: " + invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        contentStream.endText();
        currentY -= lineHeight * 2;

        // From (Shop) Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("From:");
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        if (shop.getShopName() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText(shop.getShopName());
            contentStream.endText();
            currentY -= lineHeight;
        }
        if (shop.getOwnerName() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Owner: " + shop.getOwnerName());
            contentStream.endText();
            currentY -= lineHeight;
        }
        if (shop.getEmail() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Email: " + shop.getEmail());
            contentStream.endText();
            currentY -= lineHeight;
        }
        if (shop.getWhatsappNumber() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + shop.getWhatsappNumber());
            contentStream.endText();
            currentY -= lineHeight;
        }

        currentY -= lineHeight;

        // To (Customer) Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("To:");
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText(invoice.getCustomerName());
        contentStream.endText();
        currentY -= lineHeight;

        if (invoice.getCustomerMobile() != null && !invoice.getCustomerMobile().isEmpty()) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + invoice.getCustomerMobile());
            contentStream.endText();
            currentY -= lineHeight;
        }

        if (invoice.getCustomerAddress() != null && !invoice.getCustomerAddress().isEmpty()) {
            String[] addressLines = invoice.getCustomerAddress().split("\n");
            for (String line : addressLines) {
                if (currentY < 100) {
                    contentStream.close();
                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    contentStream = new PDPageContentStream(document, page);
                    currentY = 750;
                }
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText(line);
                contentStream.endText();
                currentY -= lineHeight;
            }
        }

        currentY -= lineHeight;

        // Items Table Header
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        float tableY = currentY;
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("Sr.");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 50, tableY);
        contentStream.showText("Description");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 250, tableY);
        contentStream.showText("Size");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 350, tableY);
        contentStream.showText("Qty");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 400, tableY);
        contentStream.showText("Remarks");
        contentStream.endText();
        tableY -= lineHeight;

        // Draw line
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + 500, tableY);
        contentStream.stroke();
        tableY -= 5;

        // Items
        contentStream.setFont(PDType1Font.HELVETICA, 9);
        int srNo = 1;
        for (var item : invoice.getItems()) {
            if (tableY < 100) {
                contentStream.close();
                page = new PDPage(PDRectangle.A4);
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                tableY = 750;
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(margin, tableY);
            contentStream.showText(String.valueOf(srNo++));
            contentStream.endText();

            String itemDesc = item.getGlassType() != null ? item.getGlassType() : "";
            if (item.getThickness() != null) {
                itemDesc += " (" + item.getThickness() + "mm)";
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 50, tableY);
            contentStream.showText(itemDesc);
            contentStream.endText();

            String size = "";
            if (item.getHeight() != null && item.getWidth() != null) {
                size = String.format("%.2f", item.getHeight()) + " × " + String.format("%.2f", item.getWidth());
            }
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 250, tableY);
            contentStream.showText(size);
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 350, tableY);
            contentStream.showText(String.valueOf(item.getQuantity()));
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 400, tableY);
            contentStream.showText("Good Condition");
            contentStream.endText();

            tableY -= lineHeight;
        }

        tableY -= lineHeight * 2;

        // Signature Section
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("Received By:");
        contentStream.endText();
        tableY -= lineHeight * 3;

        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("_____________________");
        contentStream.endText();
        tableY -= lineHeight;

        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("(Signature & Stamp)");
        contentStream.endText();
        tableY -= lineHeight * 2;

        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 300, tableY);
        contentStream.showText("Delivered By:");
        contentStream.endText();
        tableY -= lineHeight * 3;

        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 300, tableY);
        contentStream.showText("_____________________");
        contentStream.endText();
        tableY -= lineHeight;

        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 300, tableY);
        contentStream.showText("(Signature & Stamp)");
        contentStream.endText();

        contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();

        return baos.toByteArray();
    }

    /**
     * Generate PDF for Delivery Challan Print (Order details only, no prices)
     * Professional format with borders and better layout
     */
    public byte[] generateDeliveryChallanPrintPdf(Long invoiceId) throws IOException {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        Shop shop = getCurrentShop();
        if (!invoice.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized access to invoice");
        }

        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        float pageHeight = page.getMediaBox().getHeight();
        
        // Calculate dimensions for 2 copies per page (half A4 each)
        float copyHeight = (pageHeight - 40) / 2; // Divide page into 2 sections with margins
        float copyGap = 10; // Gap between copies
        
        // Draw 2 copies on the same page
        for (int copyIndex = 0; copyIndex < 2; copyIndex++) {
            float copyStartY = pageHeight - 20 - (copyIndex * (copyHeight + copyGap));
            drawDeliveryChallanCopy(document, page, invoice, shop, copyStartY, copyHeight);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();

        return baos.toByteArray();
    }
    
    /**
     * Helper method to draw a single delivery challan copy at a specific Y position
     */
    private void drawDeliveryChallanCopy(PDDocument document, PDPage page, Invoice invoice, Shop shop, 
                                         float startY, float maxHeight) throws IOException {
        PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

        float margin = 30; // Reduced margin for smaller copies
        float pageWidth = page.getMediaBox().getWidth();
        float lineHeight = 12; // Reduced line height
        float currentY = startY;
        float scaleFactor = 0.75f; // Scale down to fit half page (better readability)
        float minY = startY - maxHeight + 50; // Minimum Y to prevent overflow

        // Draw top border line for this copy
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(margin, currentY);
        contentStream.lineTo(pageWidth - margin, currentY);
        contentStream.stroke();
        currentY -= 8;

        // Header Section with Shop Details (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(12 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        if (shop.getShopName() != null) {
            contentStream.showText(shop.getShopName().toUpperCase());
        } else {
            contentStream.showText("GLASS SHOP");
        }
        contentStream.endText();
        currentY -= lineHeight;

        // Shop Address and Contact (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
        if (shop.getEmail() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Email: " + shop.getEmail());
            contentStream.endText();
            currentY -= lineHeight - 2;
        }
        if (shop.getWhatsappNumber() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + shop.getWhatsappNumber());
            contentStream.endText();
            currentY -= lineHeight - 2;
        }

        currentY -= 5;

        // Title Box (scaled down)
        contentStream.setLineWidth(1f);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(16 * scaleFactor));
        float titleBoxHeight = 20 * scaleFactor;
        
        // Draw title background box
        contentStream.setNonStrokingColor(0.9f, 0.9f, 0.9f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 3, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        
        // Draw title border
        contentStream.setLineWidth(1.5f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 3, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.stroke();
        
        // Title text
        contentStream.beginText();
        contentStream.newLineAtOffset((pageWidth - margin * 2) / 2 - 50, currentY - 8);
        contentStream.showText("DELIVERY CHALLAN");
        contentStream.endText();
        currentY -= titleBoxHeight + 8;

        // Challan Details Section (scaled down)
        float detailsBoxHeight = 35;
        
        // Draw details box
        contentStream.setLineWidth(0.5f);
        contentStream.setNonStrokingColor(0.95f, 0.95f, 0.95f);
        contentStream.addRect(margin, currentY - detailsBoxHeight, pageWidth - 2 * margin, detailsBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        contentStream.addRect(margin, currentY - detailsBoxHeight, pageWidth - 2 * margin, detailsBoxHeight);
        contentStream.stroke();
        
        float detailsStartY = currentY - 6;
        float detailsX1 = margin + 5;
        
        // Left column (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY);
        contentStream.showText("Challan No:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 60, detailsStartY);
        contentStream.showText(invoice.getInvoiceNumber());
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY - lineHeight);
        contentStream.showText("Date:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 60, detailsStartY - lineHeight);
        contentStream.showText(invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        contentStream.endText();
        
        // Polish is now per-item, displayed in remarks column for each item
        
        currentY -= detailsBoxHeight + 8;

        // From (Shop) Details (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(9 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("From:");
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, (int)(8 * scaleFactor));
        if (shop.getShopName() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText(shop.getShopName());
            contentStream.endText();
            currentY -= lineHeight;
        }
        if (shop.getWhatsappNumber() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + shop.getWhatsappNumber());
            contentStream.endText();
            currentY -= lineHeight;
        }

        currentY -= 3;

        // To (Customer) Details (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(9 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("To:");
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText(invoice.getCustomerName());
        contentStream.endText();
        currentY -= lineHeight;

        if (invoice.getCustomerMobile() != null && !invoice.getCustomerMobile().isEmpty()) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + invoice.getCustomerMobile());
            contentStream.endText();
            currentY -= lineHeight;
        }

        if (invoice.getCustomerAddress() != null && !invoice.getCustomerAddress().isEmpty() && currentY > minY + 20) {
            String[] addressLines = invoice.getCustomerAddress().split("\n");
            for (String line : addressLines) {
                if (currentY <= minY) break;
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, currentY);
                contentStream.showText(line);
                contentStream.endText();
                currentY -= lineHeight;
            }
        }

        currentY -= 3;

        // Items Table Header (scaled down)
        float tableY = currentY;
        float tableWidth = pageWidth - 2 * margin;
        float dcol1 = margin + 3;
        float dcol2 = dcol1 + 20;
        float dcol3 = dcol2 + 100;
        float dcol4 = dcol3 + 50;
        float dcol5 = dcol4 + 50;
        
        // Draw table header background
        contentStream.setNonStrokingColor(0.2f, 0.2f, 0.2f);
        contentStream.addRect(margin, tableY - lineHeight - 3, tableWidth, lineHeight + 6);
        contentStream.fill();
        contentStream.setNonStrokingColor(1f, 1f, 1f);
        
        // Header text (white on dark background, scaled down)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(dcol1, tableY - 8);
        contentStream.showText("Sr.");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(dcol2, tableY - 8);
        contentStream.showText("Description");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(dcol3, tableY - 8);
        contentStream.showText("Size");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(dcol4, tableY - 8);
        contentStream.showText("Qty");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(dcol5, tableY - 8);
        contentStream.showText("Remarks");
        contentStream.endText();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        
        tableY -= lineHeight + 6;
        
        // Draw header bottom line
        contentStream.setLineWidth(1f);
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + tableWidth, tableY);
        contentStream.stroke();
        tableY -= 5;

        // Items (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
        int srNo = 1;
        for (var item : invoice.getItems()) {
            if (tableY <= minY) {
                break; // Stop if we run out of space
            }

            // Draw row background (alternating)
            if (srNo % 2 == 0) {
                contentStream.setNonStrokingColor(0.98f, 0.98f, 0.98f);
                contentStream.addRect(margin, tableY - lineHeight - 1, tableWidth, lineHeight + 2);
                contentStream.fill();
                contentStream.setNonStrokingColor(0f, 0f, 0f);
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(dcol1, tableY - 8);
            contentStream.showText(String.valueOf(srNo++));
            contentStream.endText();

            String itemDesc = item.getGlassType() != null ? item.getGlassType() : "";
            if (item.getThickness() != null) {
                itemDesc += " (" + item.getThickness() + "mm)";
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(dcol2, tableY - 8);
            contentStream.showText(itemDesc);
            contentStream.endText();

            // Size - use original fraction if available
            String size = "";
            String originalHeight = null;
            String originalWidth = null;
            boolean isMM = false;
            
            // Try to get original fraction from description JSON
            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                try {
                    String desc = item.getDescription().trim();
                    if (desc.startsWith("{") && desc.contains("heightOriginal")) {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode polishData = mapper.readTree(desc);
                        if (polishData.has("heightOriginal") && !polishData.get("heightOriginal").isNull()) {
                            originalHeight = polishData.get("heightOriginal").asText();
                        }
                        if (polishData.has("widthOriginal") && !polishData.get("widthOriginal").isNull()) {
                            originalWidth = polishData.get("widthOriginal").asText();
                        }
                        if (polishData.has("sizeInMM")) {
                            isMM = polishData.get("sizeInMM").asBoolean(false);
                        }
                    }
                } catch (Exception ex) {
                    // If JSON parsing fails, use decimal
                }
            }
            
            if (originalHeight != null && originalWidth != null && !originalHeight.isEmpty() && !originalWidth.isEmpty() && !isMM) {
                // Use original fraction input
                size = originalHeight + " × " + originalWidth;
            } else {
                // Fallback to decimal format
                if (item.getHeight() != null && item.getWidth() != null) {
                    size = String.format("%.2f", item.getHeight()) + " × " + String.format("%.2f", item.getWidth());
                }
            }
            contentStream.beginText();
            contentStream.newLineAtOffset(dcol3, tableY - 8);
            contentStream.showText(size);
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(dcol4, tableY - 8);
            contentStream.showText(String.valueOf(item.getQuantity()));
            contentStream.endText();

            String remarks = "Good Condition";
            // Add polish selection details if available
            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                try {
                    String desc = item.getDescription().trim();
                    if (desc.startsWith("{") && desc.contains("polishSelection")) {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode polishData = mapper.readTree(desc);
                        
                        int heightTable = polishData.has("heightTableNumber") ? polishData.get("heightTableNumber").asInt(6) : 6;
                        int widthTable = polishData.has("widthTableNumber") ? polishData.get("widthTableNumber").asInt(6) : 6;
                        int selectedHeight = polishData.has("selectedHeightTableValue") ? polishData.get("selectedHeightTableValue").asInt(0) : 0;
                        int selectedWidth = polishData.has("selectedWidthTableValue") ? polishData.get("selectedWidthTableValue").asInt(0) : 0;
                        
                        // Add item-level polish (Hash-Polish or CNC Polish) if available
                        String itemPolish = "";
                        if (polishData.has("itemPolish") && !polishData.get("itemPolish").isNull()) {
                            itemPolish = polishData.get("itemPolish").asText("");
                        }
                        
                        remarks = "Table: H=" + heightTable + "(" + selectedHeight + "), W=" + widthTable + "(" + selectedWidth + ")";
                        if (!itemPolish.isEmpty()) {
                            remarks = "Polish Type: " + itemPolish + " | " + remarks;
                        }
                        
                        if (polishData.has("polishSelection") && polishData.get("polishSelection").isArray()) {
                            JsonNode polishSelection = polishData.get("polishSelection");
                            String polishInfo = "";
                            for (int i = 0; i < polishSelection.size() && i < 4; i++) {
                                JsonNode ps = polishSelection.get(i);
                                if (ps.has("checked") && ps.get("checked").asBoolean(false)) {
                                    String side = ps.has("side") ? ps.get("side").asText("") : "";
                                    int sideNum = ps.has("sideNumber") ? ps.get("sideNumber").asInt(0) : 0;
                                    String type = ps.has("type") && !ps.get("type").isNull() ? ps.get("type").asText("") : "";
                                    if (!type.isEmpty()) {
                                        polishInfo += side + " " + sideNum + "=" + type + " ";
                                    }
                                }
                            }
                            if (!polishInfo.isEmpty()) {
                                remarks += " | Polish: " + polishInfo;
                            }
                        }
                    }
                } catch (Exception ex) {
                    // If JSON parsing fails, use default remarks
                }
            }
            
            // Show full remarks - split into multiple lines if needed (scaled down)
            contentStream.setFont(PDType1Font.HELVETICA, (int)(6 * scaleFactor));
            float remarksX = dcol5;
            float remarksY = tableY - 8;
            float maxRemarksWidth = (pageWidth - margin) - remarksX;
            
            // Split long remarks into multiple lines
            String[] remarksWords = remarks.split(" ");
            String currentLine = "";
            float lineSpacing = 8;
            int numLines = 1;
            
            for (String word : remarksWords) {
                String testLine = currentLine.isEmpty() ? word : currentLine + " " + word;
                // Approximate width: 3.5 pixels per character for scaled font
                float testWidth = testLine.length() * 3.5f;
                
                if (testWidth > maxRemarksWidth && !currentLine.isEmpty()) {
                    // Draw current line and start new line
                    contentStream.beginText();
                    contentStream.newLineAtOffset(remarksX, remarksY);
                    contentStream.showText(currentLine);
                    contentStream.endText();
                    remarksY -= lineSpacing;
                    currentLine = word;
                    numLines++;
                } else {
                    currentLine = testLine;
                }
            }
            
            // Draw remaining line
            if (!currentLine.isEmpty()) {
                contentStream.beginText();
                contentStream.newLineAtOffset(remarksX, remarksY);
                contentStream.showText(currentLine);
                contentStream.endText();
            }
            
            // Reset font for next item
            contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
            
            // Adjust tableY based on number of lines
            tableY -= Math.max(lineHeight, (numLines * lineSpacing)) + 2;
        }
        
        // Draw bottom border of table
        if (tableY > minY) {
            contentStream.setLineWidth(1f);
            contentStream.moveTo(margin, tableY);
            contentStream.lineTo(margin + tableWidth, tableY);
            contentStream.stroke();
            tableY -= 10;
        }

        // Footer with date (scaled down)
        if (tableY > minY + 50) {
            contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, tableY);
            contentStream.showText("Generated on: " + java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
            contentStream.endText();
            
            tableY -= 20;
            
            // Professional Signature Section (scaled down)
            float sigBoxWidth = (tableWidth - 15) / 2;
            float sigBoxHeight = 60;
            
            // Received By box with Name, Contact, Date fields
            contentStream.setLineWidth(0.5f);
            contentStream.addRect(margin, tableY - sigBoxHeight, sigBoxWidth, sigBoxHeight);
            contentStream.stroke();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(7 * scaleFactor));
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 3, tableY - 8);
            contentStream.showText("Received By:");
            contentStream.endText();
            
            contentStream.setFont(PDType1Font.HELVETICA, (int)(5 * scaleFactor));
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 3, tableY - 18);
            contentStream.showText("Name: _____________");
            contentStream.endText();
            
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 3, tableY - 28);
            contentStream.showText("Contact: _________");
            contentStream.endText();
            
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 3, tableY - 38);
            contentStream.showText("Date: _____________");
            contentStream.endText();
            
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 3, tableY - 50);
            contentStream.showText("(Signature)");
            contentStream.endText();
            
            // Delivered By box
            contentStream.addRect(margin + sigBoxWidth + 10, tableY - sigBoxHeight, sigBoxWidth, sigBoxHeight);
            contentStream.stroke();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(7 * scaleFactor));
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + sigBoxWidth + 13, tableY - 8);
            contentStream.showText("Delivered By:");
            contentStream.endText();
            contentStream.setFont(PDType1Font.HELVETICA, (int)(6 * scaleFactor));
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + sigBoxWidth + 13, tableY - 25);
            contentStream.showText("_____________");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + sigBoxWidth + 13, tableY - 40);
            contentStream.showText("(Signature)");
            contentStream.endText();
        }

        contentStream.close();
    }

    /**
     * Generate PDF for Cutting-Pad Print (Dimensions only, no prices)
     * Professional format with borders and better layout
     * Prints 3 copies per page
     */
    public byte[] generateCuttingPadPrintPdf(Long quotationId) throws IOException {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        
        Shop shop = getCurrentShop();
        if (!quotation.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized access to quotation");
        }

        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        float pageHeight = page.getMediaBox().getHeight();
        
        // Single copy sized for half A4 page (so user can print 2 copies manually)
        float copyHeight = (pageHeight - 40) / 2; // Half page height
        float copyStartY = pageHeight - 20; // Start from top
        
        drawCuttingPadCopy(document, page, quotation, shop, copyStartY, copyHeight);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();

        return baos.toByteArray();
    }
    
    /**
     * Helper method to draw a single cutting pad copy at a specific Y position
     */
    private void drawCuttingPadCopy(PDDocument document, PDPage page, Quotation quotation, Shop shop, 
                                     float startY, float maxHeight) throws IOException {
        PDPageContentStream contentStream = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

        float margin = 30; // Reduced margin for smaller copies
        float pageWidth = page.getMediaBox().getWidth();
        float lineHeight = 12; // Reduced line height
        float currentY = startY;
        float scaleFactor = 0.75f; // Scale down to fit half A4 page

        // Draw top border line for this copy
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(margin, currentY);
        contentStream.lineTo(pageWidth - margin, currentY);
        contentStream.stroke();
        currentY -= 8;

        // Header Section with Shop Details (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(12 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        if (shop.getShopName() != null) {
            contentStream.showText(shop.getShopName().toUpperCase());
        } else {
            contentStream.showText("GLASS SHOP");
        }
        contentStream.endText();
        currentY -= lineHeight;

        // Shop Address and Contact (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
        if (shop.getEmail() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Email: " + shop.getEmail());
            contentStream.endText();
            currentY -= lineHeight - 2;
        }
        if (shop.getWhatsappNumber() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + shop.getWhatsappNumber());
            contentStream.endText();
            currentY -= lineHeight - 2;
        }

        currentY -= 5;

        // Title Box (scaled down)
        contentStream.setLineWidth(1f);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(16 * scaleFactor));
        float titleBoxHeight = 20 * scaleFactor;
        
        // Draw title background box
        contentStream.setNonStrokingColor(0.9f, 0.9f, 0.9f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 3, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        
        // Draw title border
        contentStream.setLineWidth(1.5f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 3, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.stroke();
        
        // Title text
        contentStream.beginText();
        contentStream.newLineAtOffset((pageWidth - margin * 2) / 2 - 35, currentY - 8);
        contentStream.showText("CUTTING-PAD");
        contentStream.endText();
        currentY -= titleBoxHeight + 8;

        // Quotation Details (scaled down) - Show date with quotation number
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(9 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("Quotation Number: " + quotation.getQuotationNumber() + " | Date: " + quotation.getQuotationDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        contentStream.endText();
        currentY -= lineHeight;

        contentStream.setFont(PDType1Font.HELVETICA, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        contentStream.showText("Customer: " + quotation.getCustomerName());
        contentStream.endText();
        currentY -= lineHeight;
        
        currentY -= 3;

        // Items Table Header (scaled down)
        float tableY = currentY;
        float tableWidth = pageWidth - 2 * margin;
        float col1 = margin + 3;
        float col2 = col1 + 20;
        float col3 = col2 + 90;
        float col4 = col3 + 70;
        float col5 = col4 + 50;
        
        // Draw table header background
        contentStream.setNonStrokingColor(0.2f, 0.2f, 0.2f);
        contentStream.addRect(margin, tableY - lineHeight - 3, tableWidth, lineHeight + 6);
        contentStream.fill();
        contentStream.setNonStrokingColor(1f, 1f, 1f);
        
        // Header text (white on dark background)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(8 * scaleFactor));
        contentStream.beginText();
        contentStream.newLineAtOffset(col1, tableY - 8);
        contentStream.showText("Sr.");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(col2, tableY - 8);
        contentStream.showText("Glass Type");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(col3, tableY - 8);
        contentStream.showText("Height");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(col4, tableY - 8);
        contentStream.showText("Width");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(col5, tableY - 8);
        contentStream.showText("Qty");
        contentStream.endText();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        
        tableY -= lineHeight + 6;
        
        // Draw header bottom line
        contentStream.setLineWidth(1f);
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + tableWidth, tableY);
        contentStream.stroke();
        tableY -= 5;

        // Items (scaled down)
        contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
        int srNo = 1;
        float minY = startY - maxHeight + 50; // Minimum Y to prevent overflow
        
        for (var item : quotation.getItems()) {
            if (tableY < minY) {
                break; // Stop if we run out of space
            }

            // Draw row background (alternating)
            if (srNo % 2 == 0) {
                contentStream.setNonStrokingColor(0.98f, 0.98f, 0.98f);
                contentStream.addRect(margin, tableY - lineHeight - 1, tableWidth, lineHeight + 2);
                contentStream.fill();
                contentStream.setNonStrokingColor(0f, 0f, 0f);
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(col1, tableY - 8);
            contentStream.showText(String.valueOf(srNo++));
            contentStream.endText();

            String itemDesc = item.getGlassType() != null ? item.getGlassType() : "";
            if (item.getThickness() != null) {
                itemDesc += " (" + item.getThickness() + "mm)";
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(col2, tableY - 8);
            contentStream.showText(itemDesc);
            contentStream.endText();

            // Height with unit - use original fraction if available
            String heightStr = "";
            String originalHeight = null;
            boolean isMM = false;
            
            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                try {
                    String desc = item.getDescription().trim();
                    if (desc.startsWith("{") && desc.contains("heightOriginal")) {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode polishData = mapper.readTree(desc);
                        if (polishData.has("heightOriginal") && !polishData.get("heightOriginal").isNull()) {
                            originalHeight = polishData.get("heightOriginal").asText();
                        }
                        if (polishData.has("sizeInMM")) {
                            isMM = polishData.get("sizeInMM").asBoolean(false);
                        }
                    }
                } catch (Exception ex) {
                    // If JSON parsing fails, use decimal
                }
            }
            
            if (originalHeight != null && !originalHeight.isEmpty() && !isMM) {
                heightStr = originalHeight;
                if (item.getHeightUnit() != null) {
                    heightStr += " " + item.getHeightUnit();
                }
            } else {
                if (item.getHeight() != null) {
                    heightStr = String.format("%.2f", item.getHeight());
                    if (item.getHeightUnit() != null) {
                        heightStr += " " + item.getHeightUnit();
                    }
                }
            }
            contentStream.beginText();
            contentStream.newLineAtOffset(col3, tableY - 8);
            contentStream.showText(heightStr);
            contentStream.endText();

            // Width with unit - use original fraction if available
            String widthStr = "";
            String originalWidth = null;
            
            if (item.getDescription() != null && !item.getDescription().isEmpty()) {
                try {
                    String desc = item.getDescription().trim();
                    if (desc.startsWith("{") && desc.contains("widthOriginal")) {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode polishData = mapper.readTree(desc);
                        if (polishData.has("widthOriginal") && !polishData.get("widthOriginal").isNull()) {
                            originalWidth = polishData.get("widthOriginal").asText();
                        }
                    }
                } catch (Exception ex) {
                    // If JSON parsing fails, use decimal
                }
            }
            
            if (originalWidth != null && !originalWidth.isEmpty() && !isMM) {
                widthStr = originalWidth;
                if (item.getWidthUnit() != null) {
                    widthStr += " " + item.getWidthUnit();
                }
            } else {
                if (item.getWidth() != null) {
                    widthStr = String.format("%.2f", item.getWidth());
                    if (item.getWidthUnit() != null) {
                        widthStr += " " + item.getWidthUnit();
                    }
                }
            }
            contentStream.beginText();
            contentStream.newLineAtOffset(col4, tableY - 8);
            contentStream.showText(widthStr);
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(col5, tableY - 8);
            contentStream.showText(String.valueOf(item.getQuantity()));
            contentStream.endText();
            
            // Draw row bottom line
            contentStream.setLineWidth(0.3f);
            contentStream.moveTo(margin, tableY - lineHeight - 1);
            contentStream.lineTo(margin + tableWidth, tableY - lineHeight - 1);
            contentStream.stroke();
            
            tableY -= lineHeight + 1;

            // Add polish selection details BELOW the line if available (scaled down)
            if (item.getDescription() != null && !item.getDescription().isEmpty() && tableY > minY) {
                try {
                    String desc = item.getDescription().trim();
                    if (desc.startsWith("{") && desc.contains("polishSelection")) {
                        try {
                            ObjectMapper mapper = new ObjectMapper();
                            JsonNode polishData = mapper.readTree(desc);
                            
                            // Polish details box BELOW the line - Made bigger for readability
                            float polishBoxHeight = 25; // Increased from 15 to 25
                            contentStream.setNonStrokingColor(0.95f, 0.97f, 1f);
                            contentStream.addRect(margin + 3, tableY - polishBoxHeight, tableWidth - 6, polishBoxHeight);
                            contentStream.fill();
                            contentStream.setNonStrokingColor(0f, 0f, 0f);
                            contentStream.setLineWidth(0.5f);
                            contentStream.addRect(margin + 3, tableY - polishBoxHeight, tableWidth - 6, polishBoxHeight);
                            contentStream.stroke();
                            
                            // Check for item-level polish (Hash-Polish or CNC Polish)
                            String itemPolish = "";
                            if (polishData.has("itemPolish") && !polishData.get("itemPolish").isNull()) {
                                itemPolish = polishData.get("itemPolish").asText("");
                            }
                            
                            contentStream.setFont(PDType1Font.HELVETICA_BOLD, (int)(8 * scaleFactor)); // Increased from 6 to 8
                            contentStream.beginText();
                            contentStream.newLineAtOffset(margin + 6, tableY - 10);
                            if (!itemPolish.isEmpty()) {
                                contentStream.showText("Polish Type: " + itemPolish);
                            } else {
                                contentStream.showText("Polish Details:");
                            }
                            contentStream.endText();
                            
                            contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor)); // Increased from 5 to 7
                            
                            // Show polish selection for 4 sides
                            if (polishData.has("polishSelection") && polishData.get("polishSelection").isArray()) {
                                JsonNode polishSelection = polishData.get("polishSelection");
                                String polishInfo = "Sides: ";
                                for (int i = 0; i < polishSelection.size() && i < 4; i++) {
                                    JsonNode ps = polishSelection.get(i);
                                    if (ps.has("checked") && ps.get("checked").asBoolean(false)) {
                                        String side = ps.has("side") ? ps.get("side").asText("") : "";
                                        int sideNum = ps.has("sideNumber") ? ps.get("sideNumber").asInt(0) : 0;
                                        String type = ps.has("type") && !ps.get("type").isNull() ? ps.get("type").asText("") : "";
                                        if (!type.isEmpty()) {
                                            polishInfo += side + " " + sideNum + "=" + type + " ";
                                        }
                                    }
                                }
                                if (!polishInfo.equals("Sides: ")) {
                                    contentStream.beginText();
                                    contentStream.newLineAtOffset(margin + 6, tableY - 20);
                                    contentStream.showText(polishInfo);
                                    contentStream.endText();
                                }
                            }
                            
                            tableY -= polishBoxHeight + 3;
                        } catch (Exception ex) {
                            // If JSON parsing fails, ignore
                        }
                    }
                } catch (Exception e) {
                    // If JSON parsing fails, ignore
                }
            }

            tableY -= 2;
        }
        
        // Draw bottom border of table
        if (tableY > minY) {
            contentStream.setLineWidth(1f);
            contentStream.moveTo(margin, tableY);
            contentStream.lineTo(margin + tableWidth, tableY);
            contentStream.stroke();
            tableY -= 10;
        }
        
        // Footer with date and signature space (scaled down)
        if (tableY > minY + 30) {
            contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, tableY);
            contentStream.showText("Generated on: " + java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
            contentStream.endText();
            
            tableY -= 20;
            
            // Signature section (scaled down)
            float sigBoxWidth = (tableWidth - 15) / 2;
            contentStream.setLineWidth(0.5f);
            contentStream.addRect(margin, tableY - 30, sigBoxWidth, 30);
            contentStream.stroke();
            contentStream.setFont(PDType1Font.HELVETICA, (int)(7 * scaleFactor));
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 3, tableY - 8);
            contentStream.showText("Prepared By:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 3, tableY - 20);
            contentStream.showText("_____________");
            contentStream.endText();
            
            contentStream.addRect(margin + sigBoxWidth + 10, tableY - 30, sigBoxWidth, 30);
            contentStream.stroke();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + sigBoxWidth + 13, tableY - 8);
            contentStream.showText("Authorized By:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + sigBoxWidth + 13, tableY - 20);
            contentStream.showText("_____________");
            contentStream.endText();
        }

        contentStream.close();
    }

    /**
     * Generate Final Original Invoice PDF (with shop name and all details)
     * Professional format with borders and better layout
     */
    public byte[] generateInvoicePdf(Long invoiceId) throws IOException {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        Shop shop = getCurrentShop();
        if (!invoice.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized access to invoice");
        }

        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);

        float margin = 40;
        float pageWidth = page.getMediaBox().getWidth();
        float pageHeight = page.getMediaBox().getHeight();
        float yPosition = pageHeight - 40;
        float lineHeight = 18;
        float currentY = yPosition;

        // Draw top border line
        contentStream.setLineWidth(2f);
        contentStream.moveTo(margin, currentY + 20);
        contentStream.lineTo(pageWidth - margin, currentY + 20);
        contentStream.stroke();
        currentY -= 10;

        // Header Section with Shop Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, currentY);
        if (shop.getShopName() != null) {
            contentStream.showText(shop.getShopName().toUpperCase());
        } else {
            contentStream.showText("GLASS SHOP");
        }
        contentStream.endText();
        currentY -= lineHeight;

        // Shop Address and Contact
        contentStream.setFont(PDType1Font.HELVETICA, 9);
        if (shop.getOwnerName() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Owner: " + shop.getOwnerName());
            contentStream.endText();
            currentY -= lineHeight - 2;
        }
        if (shop.getEmail() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Email: " + shop.getEmail());
            contentStream.endText();
            currentY -= lineHeight - 2;
        }
        if (shop.getWhatsappNumber() != null) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, currentY);
            contentStream.showText("Mobile: " + shop.getWhatsappNumber());
            contentStream.endText();
            currentY -= lineHeight - 2;
        }

        currentY -= 10;

        // Title Box
        contentStream.setLineWidth(1.5f);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 22);
        float titleBoxHeight = 35;
        
        // Draw title background box
        contentStream.setNonStrokingColor(0.9f, 0.9f, 0.9f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 5, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        
        // Draw title border
        contentStream.setLineWidth(2f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 5, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.stroke();
        
        // Title text
        String title = invoice.getBillingType().toString().equals("GST") ? "TAX INVOICE" : "BILL / CASH MEMO";
        contentStream.beginText();
        contentStream.newLineAtOffset((pageWidth - margin * 2) / 2 - (title.length() * 6), currentY - 15);
        contentStream.showText(title);
        contentStream.endText();
        currentY -= titleBoxHeight + 15;

        // Invoice Details Section
        float detailsBoxHeight = 100;
        
        // Draw details box
        contentStream.setLineWidth(1f);
        contentStream.setNonStrokingColor(0.95f, 0.95f, 0.95f);
        contentStream.addRect(margin, currentY - detailsBoxHeight, pageWidth - 2 * margin, detailsBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        contentStream.addRect(margin, currentY - detailsBoxHeight, pageWidth - 2 * margin, detailsBoxHeight);
        contentStream.stroke();
        
        float detailsStartY = currentY - 10;
        float detailsX1 = margin + 10;
        float detailsX2 = (pageWidth - margin * 2) / 2 + margin;
        
        // Left column - Invoice Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY);
        contentStream.showText("Invoice No:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 80, detailsStartY);
        contentStream.showText(invoice.getInvoiceNumber());
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY - lineHeight);
        contentStream.showText("Date:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 80, detailsStartY - lineHeight);
        contentStream.showText(invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY - lineHeight * 2);
        contentStream.showText("Type:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 80, detailsStartY - lineHeight * 2);
        contentStream.showText(invoice.getInvoiceType().toString());
        contentStream.endText();
        
        // Right column - Customer Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX2, detailsStartY);
        contentStream.showText("Customer:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX2 + 60, detailsStartY);
        contentStream.showText(invoice.getCustomerName());
        contentStream.endText();
        
        if (invoice.getCustomerMobile() != null && !invoice.getCustomerMobile().isEmpty()) {
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2, detailsStartY - lineHeight);
            contentStream.showText("Mobile:");
            contentStream.endText();
            
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2 + 60, detailsStartY - lineHeight);
            contentStream.showText(invoice.getCustomerMobile());
            contentStream.endText();
        }
        
        if (invoice.getCustomerGstin() != null && !invoice.getCustomerGstin().isEmpty()) {
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2, detailsStartY - lineHeight * 2);
            contentStream.showText("GSTIN:");
            contentStream.endText();
            
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2 + 60, detailsStartY - lineHeight * 2);
            contentStream.showText(invoice.getCustomerGstin());
            contentStream.endText();
        }
        
        currentY -= detailsBoxHeight + 15;

        // Items Table Header
        float tableY = currentY;
        float tableWidth = pageWidth - 2 * margin;
        float fcol1 = margin + 5;       // Sr.
        float fcol2 = fcol1 + 30;      // Item
        float fcol3 = fcol2 + 100;     // Size
        float fcol4 = fcol3 + 60;      // Qty
        float fcol5 = fcol4 + 70;      // Rate
        float fcol6 = fcol5 + 80;      // Amount
        
        // Draw table header background
        contentStream.setNonStrokingColor(0.2f, 0.2f, 0.2f);
        contentStream.addRect(margin, tableY - lineHeight - 5, tableWidth, lineHeight + 10);
        contentStream.fill();
        contentStream.setNonStrokingColor(1f, 1f, 1f);
        
        // Header text (white on dark background)
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol1, tableY - 12);
        contentStream.showText("Sr.");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol2, tableY - 12);
        contentStream.showText("Item");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol3, tableY - 12);
        contentStream.showText("Size");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol4, tableY - 12);
        contentStream.showText("Qty");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol5, tableY - 12);
        contentStream.showText("Rate");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol6, tableY - 12);
        contentStream.showText("Amount");
        contentStream.endText();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        
        tableY -= lineHeight + 10;
        
        // Draw header bottom line
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + tableWidth, tableY);
        contentStream.stroke();
        tableY -= 8;

        // Items
        contentStream.setFont(PDType1Font.HELVETICA, 9);
        int srNo = 1;
        for (var item : invoice.getItems()) {
            if (tableY < 100) {
                contentStream.close();
                page = new PDPage(PDRectangle.A4);
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                tableY = pageHeight - 40;
            }

            // Draw row background (alternating for better readability)
            if (srNo % 2 == 0) {
                contentStream.setNonStrokingColor(0.98f, 0.98f, 0.98f);
                contentStream.addRect(margin, tableY - lineHeight - 2, tableWidth, lineHeight + 4);
                contentStream.fill();
                contentStream.setNonStrokingColor(0f, 0f, 0f);
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(fcol1, tableY - 12);
            contentStream.showText(String.valueOf(srNo++));
            contentStream.endText();

            String itemDesc = item.getGlassType() != null ? item.getGlassType() : "";
            if (item.getThickness() != null) {
                itemDesc += " (" + item.getThickness() + "mm)";
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(fcol2, tableY - 12);
            contentStream.showText(itemDesc);
            contentStream.endText();

            String size = "";
            if (item.getHeight() != null && item.getWidth() != null) {
                size = String.format("%.2f", item.getHeight()) + " × " + String.format("%.2f", item.getWidth()) + " ft";
            }
            contentStream.beginText();
            contentStream.newLineAtOffset(fcol3, tableY - 12);
            contentStream.showText(size);
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(fcol4, tableY - 12);
            contentStream.showText(String.valueOf(item.getQuantity()));
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(fcol5, tableY - 12);
            contentStream.showText(String.format("%.2f", item.getRatePerSqft() != null ? item.getRatePerSqft() : 0.0));
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(fcol6, tableY - 12);
            contentStream.showText(String.format("%.2f", item.getSubtotal() != null ? item.getSubtotal() : 0.0));
            contentStream.endText();
            
            // Draw row bottom line
            contentStream.setLineWidth(0.5f);
            contentStream.moveTo(margin, tableY - lineHeight - 2);
            contentStream.lineTo(margin + tableWidth, tableY - lineHeight - 2);
            contentStream.stroke();

            tableY -= lineHeight + 3;
        }
        
        // Draw bottom border of table
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + tableWidth, tableY);
        contentStream.stroke();
        tableY -= 15;

        // Totals Section
        float totalsX = fcol5;
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(totalsX, tableY);
        contentStream.showText("Subtotal:");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol6, tableY);
        contentStream.showText(String.format("%.2f", invoice.getSubtotal() != null ? invoice.getSubtotal() : 0.0));
        contentStream.endText();
        tableY -= lineHeight;

        if (invoice.getInstallationCharge() != null && invoice.getInstallationCharge() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(totalsX, tableY);
            contentStream.showText("Installation:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(fcol6, tableY);
            contentStream.showText(String.format("%.2f", invoice.getInstallationCharge()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (invoice.getTransportCharge() != null && invoice.getTransportCharge() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(totalsX, tableY);
            contentStream.showText("Transport:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(fcol6, tableY);
            contentStream.showText(String.format("%.2f", invoice.getTransportCharge()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (invoice.getDiscount() != null && invoice.getDiscount() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(totalsX, tableY);
            contentStream.showText("Discount:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(fcol6, tableY);
            contentStream.showText("-" + String.format("%.2f", invoice.getDiscount()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (invoice.getBillingType().toString().equals("GST") && invoice.getGstAmount() != null && invoice.getGstAmount() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(totalsX, tableY);
            contentStream.showText("GST (" + (invoice.getGstPercentage() != null ? invoice.getGstPercentage() : 0) + "%):");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(fcol6, tableY);
            contentStream.showText(String.format("%.2f", invoice.getGstAmount()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        tableY -= 5;
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(totalsX, tableY);
        contentStream.lineTo(margin + tableWidth, tableY);
        contentStream.stroke();
        tableY -= 10;
        
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(totalsX, tableY);
        contentStream.showText("Grand Total:");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(fcol6, tableY);
        contentStream.showText("Rs. " + String.format("%.2f", invoice.getGrandTotal() != null ? invoice.getGrandTotal() : 0.0));
        contentStream.endText();
        tableY -= lineHeight * 2;

        // Payment Status Box
        float statusBoxHeight = 60;
        contentStream.setNonStrokingColor(0.95f, 0.95f, 0.95f);
        contentStream.addRect(margin, tableY - statusBoxHeight, tableWidth, statusBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        contentStream.setLineWidth(1f);
        contentStream.addRect(margin, tableY - statusBoxHeight, tableWidth, statusBoxHeight);
        contentStream.stroke();
        
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 10, tableY - 15);
        contentStream.showText("Payment Status: " + invoice.getPaymentStatus().toString());
        contentStream.endText();
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 10, tableY - 30);
        contentStream.showText("Paid: Rs. " + String.format("%.2f", invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0));
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 10, tableY - 45);
        contentStream.showText("Due: Rs. " + String.format("%.2f", invoice.getDueAmount() != null ? invoice.getDueAmount() : 0.0));
        contentStream.endText();
        
        // Draw bottom border line
        contentStream.setLineWidth(2f);
        contentStream.moveTo(margin, 40);
        contentStream.lineTo(pageWidth - margin, 40);
        contentStream.stroke();

        contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();

        return baos.toByteArray();
    }

    /**
     * Generate Basic Invoice PDF (without shop name and logo)
     */
    public byte[] generateBasicInvoicePdf(Long invoiceId) throws IOException {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        Shop shop = getCurrentShop();
        if (!invoice.getShop().getId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized access to invoice");
        }

        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);

        float margin = 40;
        float pageWidth = page.getMediaBox().getWidth();
        float pageHeight = page.getMediaBox().getHeight();
        float yPosition = pageHeight - 40;
        float lineHeight = 18;
        float currentY = yPosition;

        // Draw top border line
        contentStream.setLineWidth(2f);
        contentStream.moveTo(margin, currentY + 20);
        contentStream.lineTo(pageWidth - margin, currentY + 20);
        contentStream.stroke();
        currentY -= 10;

        // Title Box (NO SHOP NAME) - ESTIMATE BILL
        contentStream.setLineWidth(1.5f);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 22);
        float titleBoxHeight = 35;
        
        // Draw title background box
        contentStream.setNonStrokingColor(0.9f, 0.9f, 0.9f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 5, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        
        // Draw title border
        contentStream.setLineWidth(2f);
        contentStream.addRect(margin, currentY - titleBoxHeight + 5, pageWidth - 2 * margin, titleBoxHeight);
        contentStream.stroke();
        
        // Title text - ESTIMATE BILL
        String title = "ESTIMATE BILL";
        contentStream.beginText();
        contentStream.newLineAtOffset((pageWidth - margin * 2) / 2 - (title.length() * 6), currentY - 15);
        contentStream.showText(title);
        contentStream.endText();
        currentY -= titleBoxHeight + 15;

        // Invoice Details Section
        float detailsBoxHeight = 80;
        
        // Draw details box
        contentStream.setLineWidth(1f);
        contentStream.setNonStrokingColor(0.95f, 0.95f, 0.95f);
        contentStream.addRect(margin, currentY - detailsBoxHeight, pageWidth - 2 * margin, detailsBoxHeight);
        contentStream.fill();
        contentStream.setNonStrokingColor(0f, 0f, 0f);
        contentStream.addRect(margin, currentY - detailsBoxHeight, pageWidth - 2 * margin, detailsBoxHeight);
        contentStream.stroke();
        
        float detailsStartY = currentY - 10;
        float detailsX1 = margin + 10;
        float detailsX2 = (pageWidth - margin * 2) / 2 + margin;
        
        // Left column - Invoice Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY);
        contentStream.showText("Invoice No:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 80, detailsStartY);
        contentStream.showText(invoice.getInvoiceNumber());
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY - lineHeight);
        contentStream.showText("Date:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 80, detailsStartY - lineHeight);
        contentStream.showText(invoice.getInvoiceDate().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1, detailsStartY - lineHeight * 2);
        contentStream.showText("Type:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX1 + 80, detailsStartY - lineHeight * 2);
        contentStream.showText(invoice.getInvoiceType().toString());
        contentStream.endText();
        
        // Right column - Customer Details
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX2, detailsStartY);
        contentStream.showText("Customer:");
        contentStream.endText();
        
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(detailsX2 + 60, detailsStartY);
        contentStream.showText(invoice.getCustomerName());
        contentStream.endText();
        
        if (invoice.getCustomerMobile() != null && !invoice.getCustomerMobile().isEmpty()) {
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2, detailsStartY - lineHeight);
            contentStream.showText("Mobile:");
            contentStream.endText();
            
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2 + 60, detailsStartY - lineHeight);
            contentStream.showText(invoice.getCustomerMobile());
            contentStream.endText();
        }
        
        if (invoice.getCustomerGstin() != null && !invoice.getCustomerGstin().isEmpty()) {
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2, detailsStartY - lineHeight * 2);
            contentStream.showText("GSTIN:");
            contentStream.endText();
            
            contentStream.setFont(PDType1Font.HELVETICA, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(detailsX2 + 60, detailsStartY - lineHeight * 2);
            contentStream.showText(invoice.getCustomerGstin());
            contentStream.endText();
        }
        
        currentY -= detailsBoxHeight + 15;

        // Items Table Header
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        float tableY = currentY;
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("Sr.");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 50, tableY);
        contentStream.showText("Item");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 200, tableY);
        contentStream.showText("Size");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 300, tableY);
        contentStream.showText("Qty");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 350, tableY);
        contentStream.showText("Rate");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 450, tableY);
        contentStream.showText("Amount");
        contentStream.endText();
        tableY -= lineHeight + 5;

        // Draw line under header
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + 500, tableY);
        contentStream.stroke();
        tableY -= 10; // Increased spacing after line

        // Items
        contentStream.setFont(PDType1Font.HELVETICA, 9);
        int srNo = 1;
        for (var item : invoice.getItems()) {
            if (tableY < 100) {
                contentStream.close();
                page = new PDPage(PDRectangle.A4);
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                tableY = 750;
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(margin, tableY);
            contentStream.showText(String.valueOf(srNo++));
            contentStream.endText();

            String itemDesc = item.getGlassType() != null ? item.getGlassType() : "";
            if (item.getThickness() != null) {
                itemDesc += " (" + item.getThickness() + "mm)";
            }

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 50, tableY);
            contentStream.showText(itemDesc);
            contentStream.endText();

            String size = "";
            if (item.getHeight() != null && item.getWidth() != null) {
                size = String.format("%.2f", item.getHeight()) + " × " + String.format("%.2f", item.getWidth()) + " ft";
            }
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 200, tableY);
            contentStream.showText(size);
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 300, tableY);
            contentStream.showText(String.valueOf(item.getQuantity()));
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 350, tableY);
            contentStream.showText(String.format("%.2f", item.getRatePerSqft() != null ? item.getRatePerSqft() : 0.0));
            contentStream.endText();

            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 450, tableY);
            contentStream.showText(String.format("%.2f", item.getSubtotal() != null ? item.getSubtotal() : 0.0));
            contentStream.endText();

            tableY -= lineHeight + 3; // Add spacing between rows
        }

        tableY -= 5; // Extra spacing before totals line
        contentStream.setLineWidth(1.5f);
        contentStream.moveTo(margin, tableY);
        contentStream.lineTo(margin + 500, tableY);
        contentStream.stroke();
        tableY -= lineHeight + 5; // Increased spacing after line

        // Totals
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 350, tableY);
        contentStream.showText("Subtotal:");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 450, tableY);
        contentStream.showText(String.format("%.2f", invoice.getSubtotal() != null ? invoice.getSubtotal() : 0.0));
        contentStream.endText();
        tableY -= lineHeight;

        if (invoice.getInstallationCharge() != null && invoice.getInstallationCharge() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 350, tableY);
            contentStream.showText("Installation:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 450, tableY);
            contentStream.showText(String.format("%.2f", invoice.getInstallationCharge()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (invoice.getTransportCharge() != null && invoice.getTransportCharge() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 350, tableY);
            contentStream.showText("Transport:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 450, tableY);
            contentStream.showText(String.format("%.2f", invoice.getTransportCharge()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (invoice.getDiscount() != null && invoice.getDiscount() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 350, tableY);
            contentStream.showText("Discount:");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 450, tableY);
            contentStream.showText("-" + String.format("%.2f", invoice.getDiscount()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        if (invoice.getBillingType().toString().equals("GST") && invoice.getGstAmount() != null && invoice.getGstAmount() > 0) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 350, tableY);
            contentStream.showText("GST (" + (invoice.getGstPercentage() != null ? invoice.getGstPercentage() : 0) + "%):");
            contentStream.endText();
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 450, tableY);
            contentStream.showText(String.format("%.2f", invoice.getGstAmount()));
            contentStream.endText();
            tableY -= lineHeight;
        }

        tableY -= lineHeight;
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 350, tableY);
        contentStream.showText("Grand Total:");
        contentStream.endText();
        contentStream.beginText();
        contentStream.newLineAtOffset(margin + 450, tableY);
        contentStream.showText("Rs. " + String.format("%.2f", invoice.getGrandTotal() != null ? invoice.getGrandTotal() : 0.0));
        contentStream.endText();
        tableY -= lineHeight * 2;

        // Payment Status
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("Payment Status: " + invoice.getPaymentStatus().toString());
        contentStream.endText();
        tableY -= lineHeight;
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("Paid: Rs. " + String.format("%.2f", invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0));
        contentStream.endText();
        tableY -= lineHeight;
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, tableY);
        contentStream.showText("Due: Rs. " + String.format("%.2f", invoice.getDueAmount() != null ? invoice.getDueAmount() : 0.0));
        contentStream.endText();

        contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();

        return baos.toByteArray();
    }
}

