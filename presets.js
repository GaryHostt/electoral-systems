// Historical Election Presets for Counterfactual Analysis
const ELECTION_PRESETS = {
    "sweden_2022": {
        name: "2022 Swedish General Election",
        description: "Right-wing coalition victory using Sainte-Lague method",
        system: "party-list",
        totalSeats: 349,
        threshold: 4,
        allocationMethod: "sainte-lague",
        parties: [
            { id: 3001, name: "Social Democrats", color: "#ed1b34" },
            { id: 3002, name: "Sweden Democrats", color: "#005ea1" },
            { id: 3003, name: "Moderate Party", color: "#019cdb" },
            { id: 3004, name: "Left Party", color: "#af0000" },
            { id: 3005, name: "Centre Party", color: "#006a35" },
            { id: 3006, name: "Christian Democrats", color: "#000077" },
            { id: 3007, name: "Green Party", color: "#83cf39" },
            { id: 3008, name: "Liberals", color: "#0069b4" }
        ],
        votes: {
            parties: { 
                3001: 1964474,  // Social Democrats
                3002: 1330325,  // Sweden Democrats
                3003: 1237428,  // Moderate Party
                3004: 437050,   // Left Party
                3005: 434945,   // Centre Party
                3006: 345712,   // Christian Democrats
                3007: 329242,   // Green Party
                3008: 298542    // Liberals
            }
        }
    },
    "germany_2021": {
        name: "2021 German Federal Election",
        description: "SPD victory, MMP with overhang seats and leveling. Note: The Left Party (4.9% - below 5% threshold) received full proportional representation because they won 3 direct mandates, demonstrating the 'Double Gate' rule.",
        system: "mmp",
        districtSeats: 299,      // Statutory district count
        baseListSeats: 299,      // Statutory list count
        threshold: 5,
        allocationMethod: "sainte-lague",
        levelingEnabled: true,
        parties: [
            { id: 2001, name: "SPD", color: "#E3000F" },
            { id: 2002, name: "CDU/CSU", color: "#000000" },
            { id: 2003, name: "Alliance 90/The Greens", color: "#64A12D" },
            { id: 2004, name: "FDP", color: "#FFED00" },
            { id: 2005, name: "AfD", color: "#009EE0" },
            { id: 2006, name: "The Left", color: "#BE3075" }
        ],
        candidates: [
            { id: 2001, name: "SPD Candidate", partyId: 2001 },
            { id: 2002, name: "CDU/CSU Candidate", partyId: 2002 },
            { id: 2003, name: "Alliance 90/The Greens Candidate", partyId: 2003 },
            { id: 2004, name: "FDP Candidate", partyId: 2004 },
            { id: 2005, name: "AfD Candidate", partyId: 2005 },
            { id: 2006, name: "The Left Candidate", partyId: 2006 }
        ],
        votes: {
            parties: {
                2001: 11955434,  // SPD
                2002: 11562967,  // CDU/CSU (combined: 8,774,919 + 2,788,048)
                2003: 6852206,   // Alliance 90/The Greens
                2004: 5319952,   // FDP
                2005: 4803902,   // AfD
                2006: 2270906    // The Left
            },
            candidates: {
                2001: 12184094,  // SPD
                2002: 13233971,  // CDU/CSU (combined: 10,445,923 + 2,788,048)
                2003: 6435360,   // Alliance 90/The Greens
                2004: 4019562,   // FDP
                2005: 4699917,   // AfD
                2006: 2286070    // The Left
            }
        }
    },
    "japan_2021": {
        name: "2021 Japanese General Election",
        description: "LDP majoritarian victory under Parallel voting (MMM)",
        system: "parallel",
        districtSeats: 289,      // District seats (2024 reform)
        baseListSeats: 176,      // List seats (2024 reform)
        threshold: 0, 
        allocationMethod: "dhondt",
        parties: [
            { id: 4001, name: "Liberal Democratic (LDP)", color: "#32CD32" },
            { id: 4002, name: "Constitutional Democratic (CDP)", color: "#00008B" },
            { id: 4003, name: "Nippon Ishin (Innovation)", color: "#A9A9A9" },
            { id: 4004, name: "Komeito", color: "#FFD700" },
            { id: 4005, name: "Communist Party (JCP)", color: "#FF0000" },
            { id: 4006, name: "Democratic for the People (DPP)", color: "#FF8C00" },
            { id: 4007, name: "Reiwa Shinsengumi", color: "#FF1493" }
        ],
        candidates: [
            { id: 4001, name: "Liberal Democratic (LDP) Candidate", partyId: 4001 },
            { id: 4002, name: "Constitutional Democratic (CDP) Candidate", partyId: 4002 },
            { id: 4003, name: "Nippon Ishin (Innovation) Candidate", partyId: 4003 },
            { id: 4004, name: "Komeito Candidate", partyId: 4004 },
            { id: 4005, name: "Communist Party (JCP) Candidate", partyId: 4005 },
            { id: 4006, name: "Democratic for the People (DPP) Candidate", partyId: 4006 },
            { id: 4007, name: "Reiwa Shinsengumi Candidate", partyId: 4007 }
        ],
        votes: {
            parties: {
                4001: 19914883, // LDP
                4002: 11492095, // CDP
                4003: 8050830,  // Ishin
                4004: 7114282,  // Komeito
                4005: 4166076,  // JCP
                4006: 2593396,  // DPP
                4007: 2215648   // Reiwa
            },
            candidates: {
                4001: 27626235, // LDP (Aggregate)
                4002: 17215621, // CDP
                4003: 4802860,  // Ishin
                4004: 872131,   // Komeito
                4005: 2639631,  // JCP
                4006: 1246725,  // DPP
                4007: 0         // Reiwa (Ran only list candidates)
            }
        }
    },
    "ireland_pres_2011": {
        name: "2011 Irish Presidential Election",
        description: "Multi-candidate IRV race. Higgins won through broad transfer appeal.",
        system: "irv",
        totalSeats: 1,
        totalVoters: 1612399, // Sum of all ballot counts
        parties: [
            { id: 5001, name: "Labour (Higgins)", color: "#CC0000" },
            { id: 5002, name: "Independent (Gallagher)", color: "#000000" },
            { id: 5003, name: "Sinn Féin (McGuinness)", color: "#008800" },
            { id: 5004, name: "Fine Gael (Mitchell)", color: "#6699FF" }
        ],
        candidates: [
            { id: 5001, name: "Michael D. Higgins", partyId: 5001 },
            { id: 5002, name: "Seán Gallagher", partyId: 5002 },
            { id: 5003, name: "Martin McGuinness", partyId: 5003 },
            { id: 5004, name: "Gay Mitchell", partyId: 5004 }
        ],
        ballots: [
            { preferences: [5001, 5004], percentage: 39.57, name: "Higgins loyalists" },
            { preferences: [5002, 5004, 5001], percentage: 28.50, name: "Gallagher voters" },
            { preferences: [5003, 5001], percentage: 13.72, name: "McGuinness to Higgins" },
            { preferences: [5004, 5001, 5002], percentage: 6.39, name: "Mitchell voters" },
            { preferences: [5002], percentage: 2.82, name: "Exhausted ballots" }
        ]
    },
    "new_zealand_2023": {
        name: "2023 New Zealand General Election",
        description: "Clear compensatory MMP with 5% threshold. Features two-seat overhang from Te Pāti Māori.",
        system: "mmp",
        districtSeats: 72,       // Electorate seats
        baseListSeats: 48,       // List seats
        threshold: 5,
        allocationMethod: "sainte-lague",
        levelingEnabled: false,
        parties: [
            { id: 6001, name: "National Party", color: "#00529F" },
            { id: 6002, name: "Labour Party", color: "#D82A20" },
            { id: 6003, name: "Green Party", color: "#098137" },
            { id: 6004, name: "ACT New Zealand", color: "#FDE401" },
            { id: 6005, name: "New Zealand First", color: "#000000" },
            { id: 6006, name: "Te Pāti Māori", color: "#B2001A" }
        ],
        candidates: [
            { id: 6001, name: "National Candidate", partyId: 6001 },
            { id: 6002, name: "Labour Candidate", partyId: 6002 },
            { id: 6003, name: "Green Candidate", partyId: 6003 },
            { id: 6004, name: "ACT Candidate", partyId: 6004 },
            { id: 6005, name: "NZ First Candidate", partyId: 6005 },
            { id: 6006, name: "Te Pāti Māori Candidate", partyId: 6006 }
        ],
        votes: {
            parties: {
                6001: 1085016,  // National
                6002: 767236,   // Labour
                6003: 330883,   // Green
                6004: 246409,   // ACT
                6005: 173425,   // NZ First
                6006: 87973     // Te Pāti Māori
            },
            candidates: {
                6001: 1120000,  // National
                6002: 790000,   // Labour
                6003: 240000,   // Green
                6004: 150000,   // ACT
                6005: 40000,    // NZ First
                6006: 95000     // Te Pāti Māori
            }
        }
    },
    "taiwan_2024": {
        name: "2024 Taiwan Legislative Election",
        description: "Non-compensatory parallel system (73 districts + 34 party-list). TPP emerged as third force with no districts.",
        system: "parallel",
        districtSeats: 79,       // 73 regional + 6 indigenous
        baseListSeats: 34,       // Party-list tier
        threshold: 5,
        allocationMethod: "dhondt",
        parties: [
            { id: 7001, name: "Democratic Progressive Party (DPP)", color: "#1B9431" },
            { id: 7002, name: "Kuomintang (KMT)", color: "#000095" },
            { id: 7003, name: "Taiwan People's Party (TPP)", color: "#28C7C7" }
        ],
        candidates: [
            { id: 7001, name: "DPP Candidate", partyId: 7001 },
            { id: 7002, name: "KMT Candidate", partyId: 7002 },
            { id: 7003, name: "TPP Candidate", partyId: 7003 }
        ],
        votes: {
            parties: {
                7001: 4981060,  // DPP
                7002: 4764576,  // KMT
                7003: 3040334   // TPP
            },
            candidates: {
                7001: 6095276,  // DPP
                7002: 5401933,  // KMT
                7003: 403357    // TPP
            }
        }
    },
    "israel_2022": {
        name: "2022 Israeli Legislative Election",
        description: "Single national constituency with 3.25% threshold demonstrating wasted vote effect.",
        system: "party-list",
        totalSeats: 120,
        threshold: 3.25,
        allocationMethod: "dhondt",
        parties: [
            { id: 8001, name: "Likud", color: "#005EB8" },
            { id: 8002, name: "Yesh Atid", color: "#50C8ED" },
            { id: 8003, name: "Religious Zionist Party", color: "#FF8000" },
            { id: 8004, name: "National Unity", color: "#0047AB" },
            { id: 8005, name: "Shas", color: "#000000" }
        ],
        votes: {
            parties: {
                8001: 1115336,  // Likud
                8002: 847435,   // Yesh Atid
                8003: 516470,   // Religious Zionist
                8004: 432482,   // National Unity
                8005: 392964    // Shas
            }
        }
    },
    "netherlands_2023": {
        name: "2023 Netherlands General Election",
        description: "Extremely low threshold (0.67% for one seat) leading to high party fragmentation.",
        system: "party-list",
        totalSeats: 150,
        threshold: 0.67,
        allocationMethod: "dhondt",
        parties: [
            { id: 9001, name: "Party for Freedom (PVV)", color: "#1C4788" },
            { id: 9002, name: "GroenLinks-PvdA", color: "#B40D1E" },
            { id: 9003, name: "People's Party for Freedom (VVD)", color: "#FF7F00" },
            { id: 9004, name: "New Social Contract (NSC)", color: "#00A7E1" }
        ],
        votes: {
            parties: {
                9001: 2450000,  // PVV
                9002: 1650000,  // GL/PvdA
                9003: 1589519,  // VVD
                9004: 1000000   // NSC
            }
        }
    }
};
