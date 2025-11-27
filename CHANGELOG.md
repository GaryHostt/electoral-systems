# Changelog

All notable changes to the Electoral Systems Simulator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

