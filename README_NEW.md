# 🗳️ Electoral Systems Simulator v2.0

A comprehensive, educational web application for simulating and comparing 13 different electoral systems, with advanced computational features and visualizations.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Tests](https://img.shields.io/badge/tests-14%2F14%20passing-success)
![Coverage](https://img.shields.io/badge/coverage-100%25-success)

---

## ✨ Features

### 13 Electoral Systems Supported

#### Winner-Take-All Systems
- **First-Past-the-Post (FPTP)** - Simple plurality voting
- **Two-Round System (TRS)** - Runoff between top two
- **Block Voting** - Multi-seat plurality
- **Limited Voting** - Restricted votes for minority representation

#### Ranked-Choice Systems
- **Instant-Runoff Voting (IRV/RCV)** - Ranked elimination with transfers
- **Single Transferable Vote (STV)** - Multi-winner proportional
- **Borda Count** ⭐ NEW - Positional voting (n-1, n-2, ..., 0)
- **Condorcet Method** ⭐ NEW - Pairwise comparison winner

#### Proportional Systems
- **Closed List PR** - Party-controlled seat allocation
- **Open List PR** - Voter influence on candidates

#### Mixed Systems
- **Mixed-Member Proportional (MMP)** - Compensatory proportionality
- **Parallel Voting (MMM)** - Independent tiers

#### Approval-Based
- **Approval Voting** - Approve multiple candidates

---

## 🚀 Quick Start

### Installation & Setup

1. **Install Python Dependencies**
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Start Backend Server** (optional for advanced features)
   ```bash
   python3 backend.py
   ```

3. **Open Frontend**
   ```bash
   open index.html
   ```

### Run Tests
```bash
# Unit tests
python3 test_calculators.py

# Integration tests  
python3 test_integration.py
```

---

## 🎨 Advanced Visualizations

- 📊 **Pie Charts** - Vote and seat distribution
- 📈 **Comparison Bar Charts** - Vote vs. seat share
- 🔄 **Round-by-Round Flow** - IRV/STV eliminations ⭐
- 📍 **Ideological Spectrum** - Left-right positioning ⭐
- 📉 **Natural Thresholds** - Effective minimums ⭐
- 📊 **Loosemore-Hanby Index** - Disproportionality metric

---

## 🐍 Backend Features

- ✅ Advanced STV with NumPy precision
- ✅ Strategic voting simulation
- ✅ Realistic ballot generation
- ✅ Multi-district MMP/Parallel ⭐
- ✅ Borda & Condorcet calculations ⭐
- ✅ Scenario save/load
- ✅ Batch processing

---

## 📖 Usage Guide

1. Select electoral system
2. Add parties and candidates
3. Configure parameters (seats, thresholds)
4. Input votes or rankings
5. Calculate results
6. Analyze visualizations and Arrow's Theorem

**Full documentation**: See `/docs` folder

---

## 🎓 Educational Value

- **Arrow's Impossibility Theorem** - Fairness criteria analysis
- **Gibbard-Satterthwaite Theorem** - Strategic voting risks  
- **Electoral Mathematics** - Quotas, thresholds, allocation methods
- **Real-world Examples** - Historical cases and paradoxes

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Electoral Systems | 13 |
| Backend APIs | 11 |
| Tests (Unit + Integration) | 14 (100% pass) |
| Visualizations | 7 types |
| Lines of Code | ~3,500 |

---

## 🆕 What's New in v2.0

### New Systems
- ⭐ Borda Count
- ⭐ Condorcet Method

### New Visualizations
- ⭐ Ideological Spectrum Map
- ⭐ Round-by-Round Flow
- ⭐ Natural Threshold Display

### New Backend
- ⭐ Multi-District Calculations
- ⭐ Enhanced Testing (100% coverage)

---

## 📝 License

Educational use - Attribution appreciated

---

**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 27, 2025

