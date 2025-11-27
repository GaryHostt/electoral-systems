# Electoral Systems Simulator

A comprehensive web application for simulating and comparing different electoral systems. Understand how various voting methods work and their implications through Arrow's Impossibility Theorem.

## Features

- **Create Political Parties** - Add parties with custom names and colors
- **Add Candidates** - Associate candidates with political parties
- **Input Voting Results** - Enter vote counts for parties and candidates
- **11 Electoral Systems** - Compare outcomes across different voting methods
- **Arrow's Theorem Analysis** - Understand the limitations of each system

## Supported Electoral Systems

1. **First-Past-the-Post (FPTP)** - Simple plurality voting
2. **Two-Round System (TRS)** - Runoff between top two candidates
3. **Instant-Runoff Voting (IRV)** - Ranked-choice with elimination rounds
4. **Party-List PR (Closed List)** - Proportional representation with party control
5. **Party-List PR (Open List)** - Proportional with candidate preferences
6. **Single Transferable Vote (STV)** - Multi-winner proportional system
7. **Mixed-Member Proportional (MMP)** - Combined district and proportional seats
8. **Parallel Voting (MMM)** - Independent district and list tiers
9. **Block Voting** - Multiple votes in multi-seat constituencies
10. **Limited Voting** - Fewer votes than seats available
11. **Approval Voting** - Approve multiple candidates

## How to Use

1. **Open `index.html`** in a web browser
2. **Add Political Parties** - Enter party names and select colors
3. **Add Candidates** - Create candidates and assign them to parties
4. **Select Electoral System** - Choose from the dropdown menu
5. **Enter Votes** - Input voting results based on the system
6. **Calculate Results** - Click to see election outcomes and analysis

## Understanding Arrow's Theorem

Arrow's Impossibility Theorem proves that no rank-order voting system can simultaneously satisfy all fairness criteria when there are three or more alternatives. The app explains how each system violates specific criteria:

- **Independence of Irrelevant Alternatives (IIA)**
- **Monotonicity**
- **Proportionality**
- **Pareto Efficiency**

## Technical Details

- Pure HTML, CSS, and JavaScript (no dependencies)
- Responsive design for mobile and desktop
- Client-side calculations only
- Modern browser required (ES6+)

## Educational Purpose

This simulator is designed for educational purposes to help students, researchers, and citizens understand:

- How different electoral systems produce different outcomes from the same votes
- The mathematical trade-offs inherent in voting systems
- Real-world implications of electoral system choice
- Why "perfect" voting systems don't exist (Arrow's Theorem)

## Implementation Notes

- Some systems (IRV, STV) use simplified simulations
- Real-world systems may include additional rules (thresholds, districts)
- Seat allocations use standard formulas (D'Hondt for PR systems)
- The simulation assumes honest voting (no strategic behavior modeling)

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Open source - feel free to use for educational purposes.

## Credits

Created as an educational tool for understanding comparative electoral systems and voting theory.

