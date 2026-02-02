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
    "sweden_2018": {
        name: "2018 Swedish General Election",
        description: "Hung parliament with no clear majority. Four-month government formation crisis. Sweden Democrats surge to 17.53%, becoming third-largest party.",
        system: "party-list",
        totalSeats: 349,
        threshold: 4,
        allocationMethod: "sainte-lague",
        parties: [
            { id: 3101, name: "Social Democrats", color: "#ed1b34" },
            { id: 3102, name: "Moderate Party", color: "#019cdb" },
            { id: 3103, name: "Sweden Democrats", color: "#005ea1" },
            { id: 3104, name: "Centre Party", color: "#006a35" },
            { id: 3105, name: "Left Party", color: "#af0000" },
            { id: 3106, name: "Christian Democrats", color: "#000077" },
            { id: 3107, name: "Liberals", color: "#0069b4" },
            { id: 3108, name: "Green Party", color: "#83cf39" }
        ],
        votes: {
            parties: { 
                3101: 1830386,  // Social Democrats - 28.26%
                3102: 1284698,  // Moderate Party - 19.84%
                3103: 1135627,  // Sweden Democrats - 17.53%
                3104: 557500,   // Centre Party - 8.61%
                3105: 518454,   // Left Party - 8.0%
                3106: 409478,   // Christian Democrats - 6.32%
                3107: 355546,   // Liberals - 5.49%
                3108: 285899    // Green Party - 4.41%
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
    "germany_2025": {
        name: "2025 German Federal Election",
        description: "CDU/CSU returns to power. Note: FDP (4.9% - below 5% threshold) and LINKE (3.1%) face potential exclusion unless they win direct mandates, demonstrating the 'Double Gate' rule.",
        system: "mmp",
        districtSeats: 299,
        baseListSeats: 299,
        threshold: 5,
        allocationMethod: "sainte-lague",
        levelingEnabled: true,
        parties: [
            { id: 2101, name: "CDU/CSU", color: "#000000" },
            { id: 2102, name: "AfD", color: "#009EE0" },
            { id: 2103, name: "SPD", color: "#E3000F" },
            { id: 2104, name: "GRÜNE", color: "#64A12D" },
            { id: 2105, name: "BSW", color: "#8B0000" },
            { id: 2106, name: "FDP", color: "#FFED00" },
            { id: 2107, name: "LINKE", color: "#BE3075" }
        ],
        candidates: [
            { id: 2101, name: "CDU/CSU Candidate", partyId: 2101 },
            { id: 2102, name: "AfD Candidate", partyId: 2102 },
            { id: 2103, name: "SPD Candidate", partyId: 2103 },
            { id: 2104, name: "GRÜNE Candidate", partyId: 2104 },
            { id: 2105, name: "BSW Candidate", partyId: 2105 },
            { id: 2106, name: "FDP Candidate", partyId: 2106 },
            { id: 2107, name: "LINKE Candidate", partyId: 2107 }
        ],
        votes: {
            parties: {
                2101: 14576200,  // CDU/CSU - 31.2%
                2102: 8642940,   // AfD - 18.5%
                2103: 7054500,   // SPD - 15.1%
                2104: 5325900,   // GRÜNE - 11.4%
                2105: 3830900,   // BSW - 8.2%
                2106: 2289200,   // FDP - 4.9%
                2107: 1448200    // LINKE - 3.1%
            },
            candidates: {
                2101: 15210450,  // CDU/CSU
                2102: 8233100,   // AfD
                2103: 7455200,   // SPD
                2104: 5122300,   // GRÜNE
                2105: 2105400,   // BSW
                2106: 1944200,   // FDP
                2107: 1422100    // LINKE
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
    "japan_2024": {
        name: "2024 Japanese General Election",
        description: "LDP-Komeito coalition loses majority for first time since 2009. Political funding scandal impacts LDP. DPP emerges as kingmaker with 11.3% vote share.",
        system: "parallel",
        districtSeats: 289,
        baseListSeats: 176,
        threshold: 0,
        allocationMethod: "dhondt",
        parties: [
            { id: 4101, name: "Liberal Democratic Party (LDP)", color: "#32CD32" },
            { id: 4102, name: "Constitutional Democratic Party (CDP)", color: "#00008B" },
            { id: 4103, name: "Democratic Party for the People (DPP)", color: "#FF8C00" },
            { id: 4104, name: "Komeito", color: "#FFD700" },
            { id: 4105, name: "Nippon Ishin no Kai", color: "#A9A9A9" },
            { id: 4106, name: "Reiwa Shinsengumi", color: "#FF1493" },
            { id: 4107, name: "Japanese Communist Party (JCP)", color: "#FF0000" }
        ],
        candidates: [
            { id: 4101, name: "LDP Candidate", partyId: 4101 },
            { id: 4102, name: "CDP Candidate", partyId: 4102 },
            { id: 4103, name: "DPP Candidate", partyId: 4103 },
            { id: 4104, name: "Komeito Candidate", partyId: 4104 },
            { id: 4105, name: "Nippon Ishin Candidate", partyId: 4105 },
            { id: 4106, name: "Reiwa Candidate", partyId: 4106 },
            { id: 4107, name: "JCP Candidate", partyId: 4107 }
        ],
        votes: {
            parties: {
                4101: 14582000,  // LDP - 26.7%
                4102: 11565000,  // CDP - 21.2%
                4103: 6173000,   // DPP - 11.3%
                4104: 5964000,   // Komeito - 10.9%
                4105: 5105000,   // Nippon Ishin - 9.4%
                4106: 3804000,   // Reiwa - 7.0%
                4107: 3362000    // JCP - 6.2%
            },
            candidates: {
                4101: 20867000,  // LDP
                4102: 17181000,  // CDP
                4103: 2045000,   // DPP
                4104: 732000,    // Komeito
                4105: 6048000,   // Nippon Ishin
                4106: 425000,    // Reiwa
                4107: 3695000    // JCP
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
    "alaska_2022": {
        name: "2022 Alaska U.S. House General Election",
        description: "First federal RCV election in Alaska. Mary Peltola became first Alaska Native in Congress and first Democrat to win seat since 1972. Demonstrated center-squeeze as Begich voters split between Peltola and Palin.",
        system: "irv",
        totalSeats: 1,
        totalVoters: 263658,
        parties: [
            { id: 5101, name: "Democratic", color: "#0015BC" },
            { id: 5102, name: "Republican (Palin)", color: "#E81B23" },
            { id: 5103, name: "Republican (Begich)", color: "#FF6B6B" },
            { id: 5104, name: "Libertarian", color: "#FED105" },
            { id: 5105, name: "Write-in", color: "#808080" }
        ],
        candidates: [
            { id: 5101, name: "Mary Peltola", partyId: 5101 },
            { id: 5102, name: "Sarah Palin", partyId: 5102 },
            { id: 5103, name: "Nick Begich III", partyId: 5103 },
            { id: 5104, name: "Chris Bye", partyId: 5104 },
            { id: 5105, name: "Write-ins", partyId: 5105 }
        ],
        ballots: [
            { preferences: [5101], percentage: 45.0, name: "Peltola core voters" },
            { preferences: [5102, 5103], percentage: 20.0, name: "Palin-Begich voters" },
            { preferences: [5102], percentage: 5.75, name: "Palin-only voters" },
            { preferences: [5103, 5102], percentage: 17.0, name: "Begich-Palin Republicans" },
            { preferences: [5103, 5101], percentage: 3.3, name: "Begich-Peltola crossover" },
            { preferences: [5103], percentage: 3.0, name: "Begich-only voters" },
            { preferences: [5104, 5103, 5102], percentage: 1.5, name: "Libertarian to GOP" },
            { preferences: [5101, 5103], percentage: 3.77, name: "Peltola-Begich voters" },
            { preferences: [5105], percentage: 0.44, name: "Write-in votes" },
            { preferences: [5104], percentage: 0.23, name: "Libertarian-only voters" }
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
    "new_zealand_2020": {
        name: "2020 New Zealand General Election",
        description: "Historic Labour landslide with 50% party vote - first time any party won outright majority under MMP (since 1996). Jacinda Ardern's COVID-19 response credited for victory.",
        system: "mmp",
        districtSeats: 72,
        baseListSeats: 48,
        threshold: 5,
        allocationMethod: "sainte-lague",
        levelingEnabled: false,
        parties: [
            { id: 6101, name: "Labour Party", color: "#D82A20" },
            { id: 6102, name: "National Party", color: "#00529F" },
            { id: 6103, name: "Green Party", color: "#098137" },
            { id: 6104, name: "ACT New Zealand", color: "#FDE401" },
            { id: 6105, name: "Māori Party", color: "#B2001A" }
        ],
        candidates: [
            { id: 6101, name: "Labour Candidate", partyId: 6101 },
            { id: 6102, name: "National Candidate", partyId: 6102 },
            { id: 6103, name: "Green Candidate", partyId: 6103 },
            { id: 6104, name: "ACT Candidate", partyId: 6104 },
            { id: 6105, name: "Māori Candidate", partyId: 6105 }
        ],
        votes: {
            parties: {
                6101: 1443546,  // Labour - 50.0%
                6102: 738275,   // National - 25.6%
                6103: 226757,   // Green - 7.9%
                6104: 219030,   // ACT - 7.6%
                6105: 33630     // Māori - 1.2%
            },
            candidates: {
                6101: 1311617,  // Labour
                6102: 813674,   // National
                6103: 162115,   // Green
                6104: 176128,   // ACT
                6105: 60837     // Māori
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
    "taiwan_2020": {
        name: "2020 Taiwan Legislative Election",
        description: "DPP maintains majority with 33.98% vote share. TPP emerges as third force with 11.22%, replacing NPP.",
        system: "parallel",
        districtSeats: 79,
        baseListSeats: 34,
        threshold: 5,
        allocationMethod: "dhondt",
        parties: [
            { id: 7101, name: "Democratic Progressive Party (DPP)", color: "#1B9431" },
            { id: 7102, name: "Kuomintang (KMT)", color: "#000095" },
            { id: 7103, name: "Taiwan People's Party (TPP)", color: "#28C7C7" },
            { id: 7104, name: "New Power Party (NPP)", color: "#8B4513" },
            { id: 7105, name: "People First Party (PFP)", color: "#FF6600" }
        ],
        candidates: [
            { id: 7101, name: "DPP Candidate", partyId: 7101 },
            { id: 7102, name: "KMT Candidate", partyId: 7102 },
            { id: 7103, name: "TPP Candidate", partyId: 7103 },
            { id: 7104, name: "NPP Candidate", partyId: 7104 },
            { id: 7105, name: "PFP Candidate", partyId: 7105 }
        ],
        votes: {
            parties: {
                7101: 4811241,  // DPP - 33.98%
                7102: 4723504,  // KMT - 33.36%
                7103: 1588806,  // TPP - 11.22%
                7104: 1098100,  // NPP - 7.75%
                7105: 518921    // PFP - 3.67%
            },
            candidates: {
                7101: 6332168,  // DPP
                7102: 5633749,  // KMT
                7103: 264478,   // TPP
                7104: 141952,   // NPP
                7105: 60033     // PFP
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
    "israel_2021": {
        name: "2021 Israeli General Election",
        description: "Fourth election in two years. Bennett-Lapid 'change coalition' formed despite Likud plurality. First time Arab party (Ra'am) supported coalition.",
        system: "party-list",
        totalSeats: 120,
        threshold: 3.25,
        allocationMethod: "dhondt",
        parties: [
            { id: 8101, name: "Likud", color: "#005EB8" },
            { id: 8102, name: "Yesh Atid", color: "#50C8ED" },
            { id: 8103, name: "Shas", color: "#000000" },
            { id: 8104, name: "Blue and White", color: "#4A7EBB" },
            { id: 8105, name: "Yamina", color: "#FF8C00" },
            { id: 8106, name: "Labor Party", color: "#E50000" },
            { id: 8107, name: "United Torah Judaism", color: "#000080" },
            { id: 8108, name: "Yisrael Beiteinu", color: "#C41E3A" },
            { id: 8109, name: "Religious Zionist Party", color: "#FF8000" },
            { id: 8110, name: "Joint List", color: "#00A550" },
            { id: 8111, name: "New Hope", color: "#0047AB" },
            { id: 8112, name: "Meretz", color: "#76B82A" },
            { id: 8113, name: "United Arab List (Ra'am)", color: "#009639" }
        ],
        votes: {
            parties: {
                8101: 1066892,  // Likud - 24.19%
                8102: 614112,   // Yesh Atid - 13.93%
                8103: 316008,   // Shas - 7.17%
                8104: 292257,   // Blue and White - 6.63%
                8105: 273836,   // Yamina - 6.21%
                8106: 268767,   // Labor Party - 6.09%
                8107: 248391,   // United Torah Judaism - 5.63%
                8108: 248370,   // Yisrael Beiteinu - 5.63%
                8109: 225641,   // Religious Zionist Party - 5.12%
                8110: 212583,   // Joint List - 4.82%
                8111: 209161,   // New Hope - 4.74%
                8112: 202218,   // Meretz - 4.59%
                8113: 167411    // United Arab List (Ra'am) - 3.79%
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
    },
    "netherlands_2021": {
        name: "2021 Netherlands General Election",
        description: "VVD remains largest party with 21.87%. Record 17 parties enter parliament. D66 gains significantly. Rutte forms fourth coalition government.",
        system: "party-list",
        totalSeats: 150,
        threshold: 0.67,
        allocationMethod: "dhondt",
        parties: [
            { id: 9101, name: "People's Party for Freedom (VVD)", color: "#FF7F00" },
            { id: 9102, name: "Democrats 66 (D66)", color: "#00A7E1" },
            { id: 9103, name: "Party for Freedom (PVV)", color: "#1C4788" },
            { id: 9104, name: "Christian Democratic Appeal (CDA)", color: "#00A651" },
            { id: 9105, name: "Socialist Party (SP)", color: "#FF0000" },
            { id: 9106, name: "Labour Party (PvdA)", color: "#B40D1E" },
            { id: 9107, name: "GroenLinks (GL)", color: "#73BF43" },
            { id: 9108, name: "Forum for Democracy (FvD)", color: "#800020" }
        ],
        votes: {
            parties: {
                9101: 2279130,  // VVD - 21.87%
                9102: 1565861,  // D66 - 15.02%
                9103: 1124285,  // PVV - 10.81%
                9104: 990601,   // CDA - 9.5%
                9105: 623371,   // SP - 5.98%
                9106: 595393,   // PvdA - 5.71%
                9107: 537178,   // GL - 5.16%
                9108: 523083    // FvD - 5.02%
            }
        }
    }
};
