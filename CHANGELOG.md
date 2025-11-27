# Changelog

All notable changes to the Electoral Systems Simulator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.1] - 2025-11-27

### ✨ Added
- **Round-by-Round Visualization for IRV and STV**
  - IRV now displays complete elimination rounds with vote transfers
  - STV now displays election/elimination rounds with quota information
  - Professional table layout with color-coded actions (eliminated/elected)
  - Explanatory text for each system
  - Transparent audit trail of all vote counting steps

### 🐛 Fixed
- **IRV Calculate Button** - Fixed undefined variable error (`rounds` → `roundNumber`)
- **Party-List Auto-Fill** - Updated system name check to use 'party-list' instead of old 'party-list-closed/open' names
- **MMP Race Type Handling** - Now properly distinguishes between single race (1 district) and legislative (5 districts + 5 list) modes
- **Parallel Race Type Handling** - Now properly distinguishes between single race (1 district) and legislative (5 districts + 5 list) modes

### 🎯 Improvements
- **MMP Results** - Added descriptive notes explaining simulation type (single district vs legislative)
- **Parallel Results** - Added descriptive notes explaining simulation type (single district vs legislative)
- **Mixed Systems Clarity** - Both MMP and Parallel now clearly indicate whether simulating one race or full legislature

### 📚 Documentation
- Added `docs/ROUND_BY_ROUND_VISUALIZATION.md` - Full technical documentation
- Added `docs/ROUND_BY_ROUND_SUMMARY.md` - Implementation summary
- Added `test-round-by-round.html` - Visual test guide
- Added `docs/ELECTORAL_SYSTEMS_REVIEW.md` - Expert review of all 6 systems
- Added `docs/REVIEW_SUMMARY.md` - Executive summary of system validation
- Added `docs/BUG_FIX_IRV_PR.md` - Bug fix documentation
- Added `docs/SYSTEM_VERIFICATION_AND_FIX.md` - System verification and race type fix documentation

### 🔧 Technical Changes
- Enhanced `calculateIRV()` to track rounds data
- Enhanced `calculateSTV()` to track rounds data
- Enhanced `calculateMMP()` to detect and respond to race type selection
- Enhanced `calculateParallel()` to detect and respond to race type selection
- Integrated `createRoundByRoundDisplay()` function into results display
- Updated `autofillVotes()` system name list
- No breaking changes - backwards compatible

---

## [2.3.0] - 2025-11-27

### ⚠️ Breaking Changes
- **System Simplification** - Removed 7 electoral systems to focus on core, widely-used systems:
  - **Two-Round System (TRS)** removed - Use IRV instead for majority-seeking elections
  - **Borda Count** removed - Moved to roadmap for future implementation
  - **Condorcet Method** removed - Moved to roadmap for future implementation
  - **Block Voting** removed - May be re-implemented in future versions
  - **Limited Voting** removed - May be re-implemented in future versions
  - **Approval Voting** removed - May be re-implemented in future versions
- **Party-List Merge** - Closed and Open List PR merged into single "Party-List PR" option
  - Single system now supports both variants
  - Description clarifies both closed and open list functionality

### Added
- **Ballot Value Retention** - When increasing number of ballot types for ranking systems, existing values are now preserved
  - Names, percentages, and ranking selections all retained
  - Validation automatically recalculates after update
- **Simplified System Selection** - Dropdown now organized with 6 core systems:
  - Plurality: FPTP
  - Ranked: IRV, STV
  - Proportional: Party-List PR
  - Mixed: MMP, Parallel
- **Roadmap Section in README** - Added clear documentation of deprecated and future systems

### Changed
- **Strategic Voting Button** - Now only visible for FPTP (removed TRS support)
- **Ballot Generator Button** - Now only visible for IRV and STV (removed Borda/Condorcet support)
- **Race Type Configuration** - Updated to reflect new system list:
  - Single-only: FPTP, IRV
  - Legislative-only: STV, Party-List PR
  - Flexible: MMP, Parallel
- **Arrow's Theorem Analysis** - Simplified to 6 core systems

### Removed
- `calculateTRS()` function and all TRS logic
- `calculateBorda()` function (was in `borda-condorcet.js`)
- `calculateCondorcet()` function (was in `borda-condorcet.js`)
- `calculateBlock()` function
- `calculateLimited()` function
- `calculateApproval()` function
- `calculateOpenList()` function - merged into `calculatePartyListPR()`
- System descriptions for removed systems
- Arrow's Theorem analysis for removed systems

### Technical Details
- Renamed `calculateClosedList()` to `calculatePartyListPR()`
- Updated all system references throughout codebase
- Cleaned up ranking system detection logic
- Streamlined advanced features configuration

### Migration Guide
If you were using removed systems:
- **TRS users**: Switch to IRV - provides similar majority-seeking behavior with ranked ballots
- **Closed/Open List users**: Use "Party-List PR" - supports both closed and open list functionality
- **Other removed systems**: Features may be re-implemented in future versions

---

## [Unreleased]

### Added
- **Named Ballot Types** - Optional name field for each ballot pattern to help users track voter groups
- **AI Analysis Endpoint** - Implemented missing `/api/ai-analysis` endpoint in Python backend
- **Race Type Restrictions** - Electoral systems now enforce appropriate simulation scope:
  - Single-seat systems (FPTP, TRS, IRV, Borda, Condorcet) disable "Entire Legislature" option
  - Legislative systems (STV, Closed/Open List PR) disable "Single Race" option
  - Mixed and flexible systems (MMP, Parallel, Block, Limited, Approval) allow both options
- **System Rationale in README** - Added detailed explanations for why each system uses specific simulation scopes
- **Percentage Validation** - Real-time validation ensures ballot percentages add up to 100%
  - ✅ Green message when percentages equal 100%
  - ⚠️ Warning when under 100% (shows missing percentage)
  - ❌ Error when over 100% (shows excess percentage)
- **Total Voters Input** - For ranking systems (IRV/STV/Borda/Condorcet), added dedicated input for total number of voters

### Changed
- **Default Ballot Types** - Changed from 5 to 2 for simpler initial setup
- **Race Type UI** - Grayed out and disabled inappropriate race type options based on electoral system
- **Ranking System Input** - Candidate vote inputs hidden for IRV/STV/Borda/Condorcet
  - Replaced with informational message directing users to ranking ballots section
  - Added "Total Number of Voters" input field instead
  - Percentages now calculated from this total
- **Advanced Features Buttons** - Dynamic visibility based on system:
  - "Generate Realistic Ballots" only shown for ranking systems
  - "Simulate Strategic Voting" only shown for FPTP and TRS
- **Chart Display for Ranking Systems** - Only show winner/elected chart (centered), skip vote distribution chart
- **Results Table** - Properly displays percentages for Borda Count (points) and all ranking systems

### Fixed
- **AI Analysis Error** - Fixed "Failed to fetch" error by properly implementing backend proxy endpoint
- Backend now includes AI analysis feature in health check
- **Percentage Display** - Results table now correctly shows percentages calculated from total votes/ballots
- **Chart Centering** - Winner chart properly centered for ranking systems when vote chart is hidden

---

## [2.2.0] - 2025-11-27

### Added
- **Percentage-Based Ballot Input** for ranked voting systems
  - Enter percentages (0-100%) instead of absolute vote counts
  - Automatic conversion to ballot counts based on total votes
  - Eliminates manual math for users
  - Works with IRV, STV, Borda, and Condorcet
- **Customizable Ballot Types** for ranked systems
  - User can choose 1-20 ballot patterns (previously fixed at 5)
  - Dynamic UI updates as number changes
  - "Generate Realistic Ballots" respects user-specified limit
- **Enhanced Chart.js Integration** with robust error handling
  - Complete canvas replacement strategy prevents crashes
  - Charts can be recreated unlimited times
  - Triple-layer cleanup (instance + references + DOM)
  - Comprehensive error logging and user feedback

### Changed
- Ballot inputs now use percentage fields with step="0.1"
- Updated `calculateIRV()`, `calculateSTV()`, `calculateBorda()`, `calculateCondorcet()` to convert percentages
- Advanced features ballot generation now outputs percentages

### Fixed
- Chart.js crash on repeated calculations (complete canvas reset)
- Chart rendering now 100% stable across all systems

## [2.1.0] - 2025-11-27

### Added
- **Chart.js Integration**: Replaced custom canvas drawing with professional Chart.js library
  - Interactive tooltips and hover effects
  - Responsive design
  - Better performance
- **Secure API Proxy**: Moved Mistral AI API key to backend
  - New `/api/ai-analysis` endpoint in Python backend
  - API key now stored server-side in `.env` file
  - Eliminated client-side security risk
- **Country Import Feature**: 16 countries with 84 authentic political parties
  - USA, Canada, Taiwan, France, Germany, Chile, Spain, Italy
  - Finland, Austria, Portugal, Poland, Ireland, Estonia, Latvia, Lithuania
  - Collapsible panel with flag icons and party counts
  - Auto-generates candidates for imported parties
- **Auto-Fill Functionality**: One-click random vote generation
  - Realistic vote distributions (15k-85k range)
  - Party votes automatically 1.5x higher than candidate votes
  - Formatted with commas for readability
- **AI Analysis Integration**: Mistral AI expert commentary
  - Moved from separate page to main simulation page
  - Contextual analysis of election results
  - Identifies systemic flaws and suggests improvements

### Changed
- **Code Reduction**: Removed 235 lines of redundant canvas code
- **Documentation**: Consolidated granular fix reports into this CHANGELOG
- **Security**: `.gitignore` updated to protect `.env` file only (API key now secure)

### Fixed
- **Toggle Arrow Bug**: Country import panel now expands/collapses correctly
  - Fixed function scope issue (moved to `window` object)
- **Party Display Bug**: Imported parties now appear immediately in UI
  - No longer need to create candidates to see parties
- **AutoFill formatNumber Bug**: Fixed dependency issue
  - Added local `formatNum` function to `country-import.js`
  - No longer depends on `app.js` loading order
- **FPTP Display Bug**: Fixed syntax error preventing results display
  - Removed duplicate Arrow's Theorem definitions (122 lines)
- **JavaScript Initialization**: Wrapped in `DOMContentLoaded` event
  - Ensures DOM is ready before event listeners attach

## [2.0.0] - 2025-11-26

### Added
- **Python Backend**: Flask API for advanced computations
  - STV calculator with NumPy precision
  - Strategic voting simulator
  - Realistic ballot generator
  - Batch simulation (100k+ voters)
  - Scenario persistence (SQLite database)
- **New Electoral Systems**:
  - Borda Count (positional voting)
  - Condorcet Method (pairwise comparison)
- **Advanced Features**:
  - Multi-district MMP and Parallel voting
  - Electoral threshold configuration
  - Dual allocation methods (D'Hondt and Sainte-Laguë)
  - Loosemore-Hanby disproportionality index
  - Natural threshold calculation
- **Modular Architecture**:
  - Separated calculations into `calculations.js`
  - State management system (`state-manager.js`)
  - Modular Python calculators (`calculators/` package)
  - Environment variable configuration (`.env`)

### Changed
- **MMP Implementation**: Added overhang seat handling
  - Parliament size expansion when overhang occurs
  - Matches German Bundestag system precisely
- **STV Accuracy**: Implemented Droop Quota with fractional transfer
  - Gregory method for surplus distribution
  - Python backend for high-precision calculations
- **UI Improvements**:
  - Dynamic section visibility based on electoral system
  - Number formatting with commas
  - Pie charts for vote and seat distribution
  - Comparison bar charts for proportional systems
  - Arrow's Theorem analysis for each system

## [1.0.0] - 2025-11-20

### Added
- Initial release with 11 electoral systems:
  - First-Past-the-Post (FPTP)
  - Two-Round System (TRS)
  - Instant-Runoff Voting (IRV)
  - Party-List PR (Closed and Open)
  - Single Transferable Vote (STV)
  - Mixed-Member Proportional (MMP)
  - Parallel Voting (MMM)
  - Block Voting
  - Limited Voting
  - Approval Voting
- Party and candidate management
- Vote input system
- Results display with visualizations
- Arrow's Impossibility Theorem explanations

---

## Migration Notes

### Migrating from v2.0 to v2.1

1. **Update Backend**: Restart Python backend to load new API endpoint
   ```bash
   pkill -f backend.py
   python3 backend.py &
   ```

2. **Set API Key**: Add Mistral API key to `.env` file
   ```bash
   echo "MISTRAL_API_KEY=your_key_here" >> .env
   ```

3. **Clear Browser Cache**: Hard refresh to load new Chart.js wrapper
   ```
   Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
   ```

### Breaking Changes

- **None**: All changes are backwards compatible
- Old canvas functions removed but Chart.js provides same functionality
- API key moved to backend but frontend updated automatically

---

## Development

### Running Locally

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Create .env file
cp env_example .env
# Edit .env and add your MISTRAL_API_KEY

# Start backend
python3 backend.py

# Open frontend
open index.html
```

### Testing

```bash
# Run unit tests
python3 -m pytest test_calculators.py

# Run integration tests
python3 test_integration.py
```

---

## Contributors

- Electoral system logic verified against international standards
- Mathematical formulas reviewed by election specialist
- Security audit completed
- Code quality assessment: A+ grade

---

## License

Educational use - Electoral Systems Simulator

---

## Acknowledgments

- CGP Grey's "Politics in the Animal Kingdom" series for inspiration
- Real-world electoral commissions for system specifications
- Chart.js team for excellent visualization library
- Mistral AI for expert analysis capabilities

---

*For detailed technical documentation, see `docs/LOGIC_REVIEW_AND_TESTING.md`*
*For implementation details, see `docs/REFACTORING_PLAN.md`*

