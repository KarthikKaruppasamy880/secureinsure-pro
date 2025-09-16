import express from "express";
import { buildExamOneRequestXml, parseExamOneResponseXml, getSampleExamOneResponse } from "../examoneXml";

export const examone = express.Router();

examone.post("/order", async (req, res) => {
  try {
    const { caseId, applicantData } = req.body;
    
    if (!caseId) {
      return res.status(400).json({ error: 'Case ID is required' });
    }

    // Build ExamOne request XML using the real ACORD standard
    const requestXml = buildExamOneRequestXml({
      trackingId: caseId,
      ...applicantData
    });

    // In a real implementation, you would send this XML to ExamOne
    // For now, we'll simulate the response
    const requestId = `EXM-${Date.now()}`;
    
    // Store the request for later retrieval
    // In a real app, this would be stored in a database
    global.examoneRequests = global.examoneRequests || new Map();
    global.examoneRequests.set(requestId, {
      caseId,
      requestXml,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      requestId,
      message: 'Lab order submitted successfully',
      xml: requestXml // For debugging
    });
  } catch (error) {
    console.error('Error submitting lab order:', error);
    res.status(500).json({ error: 'Failed to submit lab order' });
  }
});

examone.get("/result", async (req, res) => {
  try {
    const { requestId, caseId } = req.query;
    
    if (!requestId && !caseId) {
      return res.status(400).json({ error: 'Request ID or Case ID is required' });
    }

    // In a real implementation, you would fetch from ExamOne
    // For now, we'll return the comprehensive sample data
    const sampleResponse = getSampleExamOneResponse();

    res.json(sampleResponse);
  } catch (error) {
    console.error('Error fetching lab results:', error);
    res.status(500).json({ error: 'Failed to fetch lab results' });
  }
});

examone.get("/order/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    
    global.examoneRequests = global.examoneRequests || new Map();
    const order = global.examoneRequests.get(requestId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});
