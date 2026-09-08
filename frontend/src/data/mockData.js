/* ============================================================
   MOCK DATA — Crypto Surveillance Platform
   Structured to match expected backend API response shapes.
   ============================================================ */

export const dashboardStats = {
  transactionsAnalyzed: 847293,
  transactionsDelta: '+8.3%',
  suspiciousTransactions: 1248,
  suspiciousDelta: '+12.4%',
  highRiskAccounts: 89,
  highRiskDelta: '+3',
  detectedGroups: 23,
  detectedGroupsDelta: '+2',
  averageRiskScore: 34.7,
  modelConfidence: 91.4,
  graphNodes: 12847,
  graphEdges: 38921,
  lastUpdated: '2024-01-15T09:23:41Z',
  systemStatus: 'operational',
};

export const networkNodes = [
  { id: 'n1',  label: '0x7f3a...4d2b', risk: 'critical', txCount: 482, x: 300, y: 200 },
  { id: 'n2',  label: '0x2c1b...9e7f', risk: 'high',     txCount: 211, x: 480, y: 140 },
  { id: 'n3',  label: '0x8d4e...3a1c', risk: 'high',     txCount: 193, x: 550, y: 300 },
  { id: 'n4',  label: '0x1a9b...6f4e', risk: 'medium',   txCount: 87,  x: 150, y: 300 },
  { id: 'n5',  label: '0x5e2d...1b8a', risk: 'medium',   txCount: 64,  x: 400, y: 400 },
  { id: 'n6',  label: '0x3c7a...9d2e', risk: 'low',      txCount: 22,  x: 680, y: 200 },
  { id: 'n7',  label: '0x9f1c...5b3d', risk: 'low',      txCount: 18,  x: 200, y: 450 },
  { id: 'n8',  label: '0x4b8d...7e1a', risk: 'critical', txCount: 376, x: 450, y: 240 },
  { id: 'n9',  label: '0x6a2f...8c4b', risk: 'medium',   txCount: 55,  x: 620, y: 380 },
  { id: 'n10', label: '0x0e5b...2d9f', risk: 'low',      txCount: 11,  x: 100, y: 150 },
  { id: 'n11', label: '0xac3d...7f2e', risk: 'high',     txCount: 148, x: 350, y: 350 },
  { id: 'n12', label: '0xb71f...1e4a', risk: 'low',      txCount: 9,   x: 730, y: 300 },
];

export const networkEdges = [
  { id: 'e1',  source: 'n1', target: 'n2', suspicious: true,  amount: 84.3 },
  { id: 'e2',  source: 'n2', target: 'n1', suspicious: true,  amount: 84.1 },
  { id: 'e3',  source: 'n1', target: 'n8', suspicious: true,  amount: 210.7 },
  { id: 'e4',  source: 'n8', target: 'n1', suspicious: true,  amount: 211.2 },
  { id: 'e5',  source: 'n2', target: 'n3', suspicious: false, amount: 12.4 },
  { id: 'e6',  source: 'n3', target: 'n8', suspicious: true,  amount: 98.6 },
  { id: 'e7',  source: 'n8', target: 'n3', suspicious: true,  amount: 97.9 },
  { id: 'e8',  source: 'n4', target: 'n1', suspicious: false, amount: 5.2 },
  { id: 'e9',  source: 'n5', target: 'n11',suspicious: true,  amount: 44.1 },
  { id: 'e10', source: 'n11',target: 'n5', suspicious: true,  amount: 43.8 },
  { id: 'e11', source: 'n6', target: 'n3', suspicious: false, amount: 2.1 },
  { id: 'e12', source: 'n9', target: 'n5', suspicious: false, amount: 7.6 },
  { id: 'e13', source: 'n11',target: 'n2', suspicious: true,  amount: 67.2 },
  { id: 'e14', source: 'n2', target: 'n11',suspicious: true,  amount: 66.9 },
  { id: 'e15', source: 'n10',target: 'n4', suspicious: false, amount: 1.8 },
  { id: 'e16', source: 'n7', target: 'n9', suspicious: false, amount: 3.4 },
  { id: 'e17', source: 'n12',target: 'n6', suspicious: false, amount: 0.9 },
];

export const riskDistribution = [
  { label: 'LOW',      count: 9847,  percentage: 76.8, color: 'var(--risk-low)' },
  { label: 'MEDIUM',   count: 2184,  percentage: 17.0, color: 'var(--risk-medium)' },
  { label: 'HIGH',     count: 621,   percentage: 4.8,  color: 'var(--risk-high)' },
  { label: 'CRITICAL', count: 195,   percentage: 1.5,  color: 'var(--risk-critical)' },
];

export const agentResults = {
  structural: {
    name: 'Structural Agent',
    role: 'Graph Topology Analysis',
    status: 'active',
    score: 78.4,
    confidence: 88.2,
    findings: [
      'Circular transaction pattern detected — 3-node closed loop',
      'Dense subgraph cluster with 5 accounts, 23 internal edges',
      'Unusual graph centrality for accounts 0x7f3a and 0x4b8d',
    ],
  },
  behavioral: {
    name: 'Behavioral Agent',
    role: 'Trading Pattern Analysis',
    status: 'active',
    score: 84.1,
    confidence: 92.7,
    findings: [
      'Synchronized transaction timing — <180ms intervals across cluster',
      'Repeated counterparty interactions: 47 round-trips detected',
      'Volume mirroring: matched amounts within 0.5% tolerance',
    ],
  },
  fusion: {
    name: 'Fusion Layer',
    role: 'Multi-Agent Risk Assessment',
    status: 'completed',
    score: 82.0,
    confidence: 91.4,
    findings: [
      'Combined structural and behavioral signals confirm wash trading pattern',
      'Overall risk classification: HIGH — Potential Wash Trading',
      'Cluster involves 4 primary accounts with 2 relay accounts',
    ],
  },
};

export const transactionsList = [
  { id: '0x7a3f2b...91cd', from: '0x7f3a...4d2b', to: '0x2c1b...9e7f', amount: 84.32,  token: 'ETH', timestamp: '2024-01-15T09:14:22Z', risk: 82, riskLabel: 'HIGH',     status: 'confirmed', suspicious: true },
  { id: '0x2c9d1a...44ef', from: '0x2c1b...9e7f', to: '0x7f3a...4d2b', amount: 84.11,  token: 'ETH', timestamp: '2024-01-15T09:14:39Z', risk: 81, riskLabel: 'HIGH',     status: 'confirmed', suspicious: true },
  { id: '0x8f4e3b...72bc', from: '0x7f3a...4d2b', to: '0x4b8d...7e1a', amount: 210.70, token: 'ETH', timestamp: '2024-01-15T09:16:01Z', risk: 95, riskLabel: 'CRITICAL',  status: 'confirmed', suspicious: true },
  { id: '0x1a7c9d...33fa', from: '0x4b8d...7e1a', to: '0x7f3a...4d2b', amount: 211.20, token: 'ETH', timestamp: '2024-01-15T09:16:07Z', risk: 96, riskLabel: 'CRITICAL',  status: 'confirmed', suspicious: true },
  { id: '0x5d2b8e...19ab', from: '0x3c7a...9d2e', to: '0x8d4e...3a1c', amount: 12.40,  token: 'ETH', timestamp: '2024-01-15T08:44:11Z', risk: 18, riskLabel: 'LOW',      status: 'confirmed', suspicious: false},
  { id: '0x9e1f4a...67dc', from: '0x5e2d...1b8a', to: '0xac3d...7f2e', amount: 44.08,  token: 'ETH', timestamp: '2024-01-15T08:31:55Z', risk: 71, riskLabel: 'HIGH',     status: 'confirmed', suspicious: true },
  { id: '0x3b6d2c...55ae', from: '0xac3d...7f2e', to: '0x5e2d...1b8a', amount: 43.82,  token: 'ETH', timestamp: '2024-01-15T08:32:14Z', risk: 69, riskLabel: 'MEDIUM',    status: 'confirmed', suspicious: true },
  { id: '0x0c8a7b...11ef', from: '0x0e5b...2d9f', to: '0x1a9b...6f4e', amount: 1.84,   token: 'ETH', timestamp: '2024-01-15T08:12:30Z', risk: 8,  riskLabel: 'LOW',      status: 'confirmed', suspicious: false},
  { id: '0xe4f9b3...28cd', from: '0x6a2f...8c4b', to: '0x5e2d...1b8a', amount: 7.62,   token: 'ETH', timestamp: '2024-01-15T07:58:47Z', risk: 22, riskLabel: 'LOW',      status: 'confirmed', suspicious: false},
  { id: '0xa7d4c1...90bf', from: '0xac3d...7f2e', to: '0x2c1b...9e7f', amount: 67.21,  token: 'ETH', timestamp: '2024-01-15T07:44:12Z', risk: 74, riskLabel: 'HIGH',     status: 'confirmed', suspicious: true },
  { id: '0xf2b9e8...45ad', from: '0x2c1b...9e7f', to: '0xac3d...7f2e', amount: 66.94,  token: 'ETH', timestamp: '2024-01-15T07:44:28Z', risk: 73, riskLabel: 'HIGH',     status: 'confirmed', suspicious: true },
  { id: '0xc5a3d7...66bc', from: '0x9f1c...5b3d', to: '0x6a2f...8c4b', amount: 3.41,   token: 'ETH', timestamp: '2024-01-15T07:30:05Z', risk: 11, riskLabel: 'LOW',      status: 'confirmed', suspicious: false},
  { id: '0xb8e2f1...77ea', from: '0xb71f...1e4a', to: '0x3c7a...9d2e', amount: 0.94,   token: 'ETH', timestamp: '2024-01-15T07:18:44Z', risk: 5,  riskLabel: 'LOW',      status: 'confirmed', suspicious: false},
  { id: '0x42c7a9...88db', from: '0x8d4e...3a1c', to: '0x4b8d...7e1a', amount: 98.62,  token: 'ETH', timestamp: '2024-01-15T06:55:21Z', risk: 89, riskLabel: 'CRITICAL',  status: 'confirmed', suspicious: true },
  { id: '0x7f1b3e...99fc', from: '0x4b8d...7e1a', to: '0x8d4e...3a1c', amount: 97.88,  token: 'ETH', timestamp: '2024-01-15T06:55:34Z', risk: 88, riskLabel: 'CRITICAL',  status: 'confirmed', suspicious: true },
];

export const analyticsData = {
  riskOverTime: [
    { date: 'Jan 9',  low: 8420, medium: 1840, high: 490, critical: 142 },
    { date: 'Jan 10', low: 9100, medium: 2010, high: 543, critical: 168 },
    { date: 'Jan 11', low: 8740, medium: 1920, high: 521, critical: 155 },
    { date: 'Jan 12', low: 9320, medium: 2180, high: 587, critical: 181 },
    { date: 'Jan 13', low: 8960, medium: 2050, high: 559, critical: 172 },
    { date: 'Jan 14', low: 9540, medium: 2240, high: 611, critical: 189 },
    { date: 'Jan 15', low: 9847, medium: 2184, high: 621, critical: 195 },
  ],
  patternDistribution: [
    { pattern: 'Wash Trading',        count: 487, percentage: 39.0 },
    { pattern: 'Circular Tx',         count: 312, percentage: 25.0 },
    { pattern: 'Volume Coordination', count: 226, percentage: 18.1 },
    { pattern: 'Timing Sync',         count: 148, percentage: 11.9 },
    { pattern: 'Cluster Activity',    count: 75,  percentage: 6.0  },
  ],
  modelPerformance: {
    accuracy:  0.934,
    precision: 0.918,
    recall:    0.927,
    f1:        0.922,
    auc:       0.971,
    confusionMatrix: {
      tp: 1154, fp: 94,
      fn: 91,   tn: 11847,
    },
  },
  graphStats: {
    totalNodes:       12847,
    totalEdges:       38921,
    avgDegree:        6.06,
    graphDensity:     0.00047,
    suspiciousClusters: 23,
    largestClusterSize: 8,
    avgPathLength:    4.2,
  },
};

export const detectionSample = {
  query: '0x7f3a...4d2b',
  riskScore: 82,
  riskLabel: 'HIGH',
  classification: 'Potential Wash Trading',
  timestamp: '2024-01-15T09:23:41Z',
  structural: agentResults.structural,
  behavioral: agentResults.behavioral,
  fusion: agentResults.fusion,
  evidence: [
    {
      id: 'ev1',
      type: 'Circular Transaction Pattern',
      description: 'Account participates in a 3-node closed loop with accounts 0x2c1b and 0x4b8d — funds return to origin within 47 seconds.',
      severity: 'critical',
      metric: '47 round-trip transactions detected',
    },
    {
      id: 'ev2',
      type: 'Repeated Counterparty Interaction',
      description: 'Same pair of accounts transacted 47 times within a 6-hour window with near-identical amounts and opposite directions.',
      severity: 'high',
      metric: '47 reciprocal transactions, avg Δ 0.28%',
    },
    {
      id: 'ev3',
      type: 'Synchronized Timing',
      description: 'Round-trip transactions complete within 6–18 seconds of each other, far below typical market behavior intervals.',
      severity: 'high',
      metric: 'Avg round-trip: 13.2s',
    },
    {
      id: 'ev4',
      type: 'Volume Mirroring',
      description: 'Transaction amounts between accounts 0x7f3a and 0x4b8d differ by less than 0.5% across all matched pairs.',
      severity: 'high',
      metric: 'Max deviation: 0.48%',
    },
    {
      id: 'ev5',
      type: 'Dense Graph Substructure',
      description: 'Accounts form a dense subgraph with 4 primary nodes and 2 relay nodes — graph density within cluster: 0.83.',
      severity: 'medium',
      metric: 'Cluster density: 0.83 (network avg: 0.00047)',
    },
  ],
};
