# 🗳️ Electoral Systems Simulator v2.3

A comprehensive, educational web application for simulating and comparing 6 core electoral systems, with advanced computational features and visualizations.

![Version](https://img.shields.io/badge/version-2.3.0-blue)
![Tests](https://img.shields.io/badge/tests-passing-success)
![Charts](https://img.shields.io/badge/charting-Chart.js-brightgreen)

---

## ⚠️ Important Security Note

**This repository contains sensitive API credentials in `learn-more.html`**

- The file `learn-more.html` contains a Mistral AI API key
- This file is added to `.gitignore` to prevent accidental commits
- **DO NOT commit this file to public repositories**
- If you clone this project, you'll need to add your own API key
- For production deployment, move API calls to the backend (see `SECURITY_NOTES.md`)

**Client-Side Limitation**: API keys in browser JavaScript are visible in DevTools. For production use, implement server-side API calls through the Python backend.

---

## ✨ Features

### 6 Core Electoral Systems Supported

#### Plurality Systems
- **First-Past-the-Post (FPTP)** - Simple plurality voting  
  *Individual race simulation: Single-seat system where each district elects one member*

#### Ranked-Choice Systems
- **Instant-Runoff Voting (IRV/RCV)** - Ranked elimination with transfers  
  *Individual race simulation: Single-winner election using ranked choices to simulate runoffs*
- **Single Transferable Vote (STV)** - Multi-winner proportional  
  *Legislative simulation: Fundamentally proportional and multi-winner, requires multiple seats to demonstrate vote transfers*

#### Proportional Systems
- **Party-List PR** - Proportional seat allocation by party  
  *Legislative simulation: Allocates seats proportionally using divisor methods at national/regional level*
  *Supports both Closed List (party-controlled) and Open List (voter influence on candidates)*

#### Mixed Systems
- **Mixed-Member Proportional (MMP)** - Compensatory proportionality  
  *Both simulation types: Combines district races (FPTP) with proportional top-up layer for overall proportionality*
- **Parallel Voting (MMM)** - Independent tiers  
  *Both simulation types: District races plus separate proportional list without compensatory adjustment*

---

### 🗺️ System Roadmap

#### Deprecated Systems (v2.3)
For simplicity and focus, the following systems have been removed:
- **Two-Round System (TRS)** - *Recommended alternative: Use IRV instead, which achieves similar majority-seeking goals through ranked-choice elimination*
- **Block Voting** - *May be re-implemented in future versions*
- **Limited Voting** - *May be re-implemented in future versions*
- **Approval Voting** - *May be re-implemented in future versions*

#### Future Roadmap
Systems planned for future implementation:
- **Borda Count** - Positional voting system (n-1, n-2, ..., 0 points)
- **Condorcet Method** - Pairwise comparison winner

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

## 🆕 What's New in v2.2

### Latest Features (November 27, 2025)
- ⭐ **Percentage-Based Ballot Input** - Enter percentages instead of absolute counts for ranked systems
- ⭐ **Customizable Ballot Types** - Choose 1-20 ballot patterns for IRV/STV/Borda/Condorcet
- ⭐ **Chart.js Integration** - Professional interactive charts with tooltips
- ⭐ **Country Import** - 16 countries with 84+ authentic political parties
- ⭐ **Secure AI Analysis** - Mistral AI integration with server-side API key
- ⭐ **Auto-Fill Votes** - One-click realistic vote generation

### New Systems (v2.0)
- ⭐ Borda Count
- ⭐ Condorcet Method

### Enhanced Backend (v2.0)
- ⭐ Multi-District Calculations
- ⭐ Strategic Voting Simulation
- ⭐ Realistic Ballot Generation
- ⭐ 100% Test Coverage

---

## 📝 License

Educational use - Attribution appreciated

---

**Version**: 2.2.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 27, 2025

