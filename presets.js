// Historical Election Presets for Counterfactual Analysis
const ELECTION_PRESETS = {
    "uk_2017": {
        name: "2017 United Kingdom General Election",
        description: "Theresa May's snap election backfired. Conservatives lost majority, forming minority government with DUP support. Demonstrates FPTP disproportionality: Conservatives got 42.4% votes but 48.8% seats; UKIP got 1.8% votes but 0 seats.",
        system: "fptp",
        raceType: "legislative",  // Force legislative mode for FPTP
        totalSeats: 650,
        threshold: 0,  // FPTP has no threshold
        allocationMethod: "plurality",  // For display purposes
        parties: [
            { id: 9001, name: "Conservative Party", color: "#0087DC" },
            { id: 9002, name: "Labour Party", color: "#E4003B" },
            { id: 9003, name: "Scottish National Party", color: "#FDF38E" },
            { id: 9004, name: "Liberal Democrats", color: "#FAA61A" },
            { id: 9005, name: "Democratic Unionist Party", color: "#D46A4C" },
            { id: 9006, name: "Sinn Féin", color: "#326760" },
            { id: 9007, name: "Plaid Cymru", color: "#005B54" },
            { id: 9008, name: "Green Party", color: "#6AB023" },
            { id: 9009, name: "UKIP", color: "#70147A" },
            { id: 9010, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                9001: 13636684,  // Conservative Party
                9002: 12877918,  // Labour Party
                9003: 977569,    // SNP
                9004: 2371861,   // Liberal Democrats
                9005: 292316,    // DUP
                9006: 238915,    // Sinn Féin
                9007: 164466,    // Plaid Cymru
                9008: 525665,    // Green Party
                9009: 594068,    // UKIP
                9010: 524722     // Others
            }
        },
        seats: {
            9001: 317,  // Conservative Party
            9002: 262,  // Labour Party
            9003: 35,   // SNP
            9004: 12,   // Liberal Democrats
            9005: 10,   // DUP
            9006: 7,    // Sinn Féin
            9007: 4,    // Plaid Cymru
            9008: 1,    // Green Party
            9009: 0,    // UKIP
            9010: 2     // Others
        }
    },
    "canada_2008": {
        name: "2008 Canadian Federal Election",
        description: "40th Canadian General Election. Conservative minority government. Green Party won 6.78% but zero seats, highlighting FPTP's disproportionality. Bloc Québécois regional concentration secured 49 seats with just 9.98%.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 308,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 10001, name: "Conservative Party", color: "#1A4782" },
            { id: 10002, name: "Liberal Party", color: "#D71920" },
            { id: 10003, name: "New Democratic Party (NDP)", color: "#F37021" },
            { id: 10004, name: "Bloc Québécois", color: "#87CEEB" },
            { id: 10005, name: "Green Party", color: "#6AB023" },
            { id: 10006, name: "Independent / Others", color: "#808080" }
        ],
        candidates: [
            { id: 10001, name: "Conservative Candidate", partyId: 10001 },
            { id: 10002, name: "Liberal Candidate", partyId: 10002 },
            { id: 10003, name: "NDP Candidate", partyId: 10003 },
            { id: 10004, name: "Bloc Candidate", partyId: 10004 },
            { id: 10005, name: "Green Candidate", partyId: 10005 },
            { id: 10006, name: "Independent Candidate", partyId: 10006 }
        ],
        votes: {
            parties: {
                10001: 5209069,  // Conservative - 37.65%
                10002: 3633185,  // Liberal - 26.26%
                10003: 2515288,  // NDP - 18.18%
                10004: 1379991,  // Bloc Québécois - 9.98%
                10005: 937613,   // Green - 6.78%
                10006: 159148    // Independent / Others - 1.15%
            }
        },
        seats: {
            10001: 143,  // Conservative
            10002: 77,   // Liberal
            10003: 37,   // NDP
            10004: 49,   // Bloc Québécois
            10005: 0,    // Green
            10006: 2     // Independent / Others
        }
    },
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
        },
        actualSeats: {
            2001: 206,  // SPD
            2002: 197,  // CDU/CSU
            2003: 118,  // Alliance 90/The Greens
            2004: 92,   // FDP
            2005: 83,   // AfD
            2006: 39    // The Left
        },
        specialSeats: {
            ssw: 1  // SSW (South Schleswig Voters' Association) - minority party, 1 seat
        },
        overhangSeats: 138,
        finalParliamentSize: 736  // Total including overhang and SSW
    },
    "germany_2017": {
        name: "2017 German Federal Election",
        description: "Merkel's fourth term. Significant expansion of the Bundestag (709 seats) due to 111 overhang and leveling seats. First entry of the AfD as the third-largest force.",
        system: "mmp",
        districtSeats: 299,
        baseListSeats: 299,
        threshold: 5,
        bypassThreshold: 3,
        allocationMethod: "sainte-lague",
        levelingEnabled: true,
        parties: [
            { id: 1001, name: "CDU/CSU", color: "#000000" },
            { id: 1002, name: "SPD", color: "#E3000F" },
            { id: 1003, name: "AfD", color: "#009EE0" },
            { id: 1004, name: "FDP", color: "#FFED00" },
            { id: 1005, name: "The Left", color: "#BE3075" },
            { id: 1006, name: "Alliance 90/The Greens", color: "#64A12D" }
        ],
        candidates: [
            { id: 1001, name: "CDU/CSU Candidate", partyId: 1001 },
            { id: 1002, name: "SPD Candidate", partyId: 1002 },
            { id: 1003, name: "AfD Candidate", partyId: 1003 },
            { id: 1004, name: "FDP Candidate", partyId: 1004 },
            { id: 1005, name: "The Left Candidate", partyId: 1005 },
            { id: 1006, name: "Alliance 90/The Greens Candidate", partyId: 1006 }
        ],
        votes: {
            parties: {
                1001: 15317344, // CDU/CSU
                1002: 9539381,  // SPD
                1003: 5878115,  // AfD
                1004: 4999449,  // FDP
                1005: 4297270,  // The Left
                1006: 4158400   // Alliance 90/The Greens
            },
            candidates: {
                1001: 17286238, // CDU/CSU (CDU: 14,030,751 + CSU: 3,255,487)
                1002: 11429231, // SPD
                1003: 5317499,  // AfD
                1004: 3249238,  // FDP
                1005: 3966637,  // The Left
                1006: 3717922   // Alliance 90/The Greens
            }
        },
        actualSeats: {
            1001: 246,  // CDU/CSU
            1002: 153,  // SPD
            1003: 94,   // AfD
            1004: 80,   // FDP
            1005: 69,   // The Left
            1006: 67    // Alliance 90/The Greens
        },
        overhangSeats: 111,
        finalParliamentSize: 709
    },
    "japan_2021": {
        name: "2021 Japanese General Election",
        description: "LDP majoritarian victory under Parallel voting (MMM). Opposition cooperation in 75% of districts was offset by LDP rural dominance.",
        system: "parallel",
        districtSeats: 289,
        baseListSeats: 176,
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
                4001: 19914883, // LDP PR
                4002: 11492095, // CDP PR
                4003: 8050830,  // Ishin PR
                4004: 7114282,  // Komeito PR
                4005: 4166076,  // JCP PR
                4006: 2593396,  // DPP PR
                4007: 2215648   // Reiwa PR
            },
            candidates: {
                4001: 27626235, // LDP Constituency
                4002: 17215621, // CDP Constituency
                4003: 4802860,  // Ishin Constituency
                4004: 872131,   // Komeito Constituency
                4005: 2639631,  // JCP Constituency
                4006: 1246725,  // DPP Constituency
                4007: 0         // Reiwa (Ran only list candidates)
            }
        },
        // NEW: Locked district results to ensure MMM logic works correctly
        actualDistrictWins: {
            4001: 187, // LDP won 187 districts
            4002: 57,  // CDP won 57 districts
            4003: 16,  // Ishin won 16 districts
            4004: 9,   // Komeito won 9 districts
            4005: 1,   // JCP won 1 district
            4006: 6,   // DPP won 6 districts
            4007: 0
        },
        actualSeats: {
            4001: 259, // 187 Dist + 72 PR
            4002: 96,  // 57 Dist + 39 PR
            4003: 41,  // 16 Dist + 25 PR
            4004: 32,  // 9 Dist + 23 PR
            4005: 10,  // 1 Dist + 9 PR
            4006: 11,  // 6 Dist + 5 PR
            4007: 3    // 0 Dist + 3 PR
        },
        specialSeats: { others: 13 }, // Independents/Social Democrats
        finalParliamentSize: 465
    },
    "japan_2024": {
        name: "2024 Japanese General Election",
        description: "LDP-Komeito coalition loses majority. Political funding scandals lead to significant seat losses for the LDP.",
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
                4101: 14582690,
                4102: 11564222,
                4103: 6172434,
                4104: 5964415,
                4105: 5105127,
                4106: 3805060,
                4107: 3362966
            },
            candidates: {
                4101: 20867762,
                4102: 15740860,
                4103: 2349584,
                4104: 730401,
                4105: 6048103,
                4106: 425445,
                4107: 3695807
            }
        },
        // NEW: Actual 2024 District breakdown
        actualDistrictWins: {
            4101: 132, // LDP
            4102: 104, // CDP
            4103: 11,  // DPP
            4104: 4,   // Komeito
            4105: 23,  // Ishin
            4106: 0,   // Reiwa
            4107: 1    // JCP
        },
        actualSeats: {
            4101: 191, // 132 + 59
            4102: 148, // 104 + 44
            4103: 28,  // 11 + 17
            4104: 24,  // 4 + 20
            4105: 38,  // 23 + 15
            4106: 9,   // 0 + 9
            4107: 8    // 1 + 7
        },
        specialSeats: { others: 19 }, // Independents/Sanseito/Conservative
        finalParliamentSize: 465
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
        },
        actualSeats: {
            6001: 48,  // National
            6002: 34,  // Labour
            6003: 15,  // Green
            6004: 11,  // ACT
            6005: 8,   // NZ First
            6006: 6    // Te Pāti Māori
        },
        overhangSeats: 2,  // Te Pāti Māori won 6 electorate seats but entitled to only 4 proportionally
        finalParliamentSize: 122  // Later 123 after by-election
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
        },
        actualSeats: {
            6101: 65,  // Labour
            6102: 33,  // National
            6103: 10,  // Green
            6104: 10,  // ACT
            6105: 2    // Te Pāti Māori
        },
        overhangSeats: 0,
        finalParliamentSize: 120  // Standard size, no overhang
    },
    "taiwan_2024": {
        name: "2024 Taiwan Legislative Election",
        description: "Hung parliament. KMT becomes largest party, DPP loses majority, TPP holds balance of power. Total 113 seats.",
        system: "parallel",
        districtSeats: 79,
        baseListSeats: 34,
        threshold: 5,
        allocationMethod: "dhondt",
        parties: [
            { id: 5101, name: "Kuomintang (KMT)", color: "#000095" },
            { id: 5102, name: "Democratic Progressive (DPP)", color: "#1B9431" },
            { id: 5103, name: "Taiwan People's Party (TPP)", color: "#28C8C8" },
            { id: 5104, name: "New Power Party (NPP)", color: "#FBBE01" }
        ],
        candidates: [
            { id: 5101, name: "KMT Candidate", partyId: 5101 },
            { id: 5102, name: "DPP Candidate", partyId: 5102 },
            { id: 5103, name: "TPP Candidate", partyId: 5103 },
            { id: 5104, name: "NPP Candidate", partyId: 5104 }
        ],
        votes: {
            parties: {
                5101: 4764293,  // KMT PR (34.58%)
                5102: 4981060,  // DPP PR (36.16%)
                5103: 3040334,  // TPP PR (22.07%)
                5104: 353670    // NPP PR (2.57% - Failed 5% threshold)
            },
            candidates: {
                5101: 5401933,  // KMT Constituency
                5102: 6095276,  // DPP Constituency
                5103: 403357,   // TPP Constituency
                5104: 96589     // NPP Constituency
            }
        },
        actualDistrictWins: {
            5101: 39, // 36 Dist + 3 Indig
            5102: 38, // 36 Dist + 2 Indig
            5103: 0,
            5104: 0
        },
        actualSeats: {
            5101: 52, // 39 Dist + 13 PR
            5102: 51, // 38 Dist + 13 PR
            5103: 8,  // 0 Dist + 8 PR
            5104: 0
        },
        specialSeats: { others: 2 }, // 2 Independents (1 Indig, 1 General - caucus with KMT)
        finalParliamentSize: 113
    },
    "taiwan_2020": {
        name: "2020 Taiwan Legislative Election",
        description: "DPP retains majority. Newcomers TPP and TSP enter the legislature. Total 113 seats (73 Dist + 6 Indig + 34 List).",
        system: "parallel",
        districtSeats: 79,      // 73 General + 6 Indigenous
        baseListSeats: 34,
        threshold: 5,           // Strict 5% threshold
        allocationMethod: "dhondt",
        parties: [
            { id: 5001, name: "Democratic Progressive (DPP)", color: "#1B9431" },
            { id: 5002, name: "Kuomintang (KMT)", color: "#000095" },
            { id: 5003, name: "Taiwan People's Party (TPP)", color: "#28C8C8" },
            { id: 5004, name: "New Power Party (NPP)", color: "#FBBE01" },
            { id: 5005, name: "Taiwan Statebuilding (TSP)", color: "#A73F24" },
            { id: 5006, name: "People First Party (PFP)", color: "#FF6310" }
        ],
        candidates: [
            { id: 5001, name: "DPP Candidate", partyId: 5001 },
            { id: 5002, name: "KMT Candidate", partyId: 5002 },
            { id: 5003, name: "TPP Candidate", partyId: 5003 },
            { id: 5004, name: "NPP Candidate", partyId: 5004 },
            { id: 5005, name: "TSP Candidate", partyId: 5005 },
            { id: 5006, name: "PFP Candidate", partyId: 5006 }
        ],
        votes: {
            parties: {
                5001: 4811241,  // DPP PR (33.98%)
                5002: 4724210,  // KMT PR (33.36%)
                5003: 1588806,  // TPP PR (11.22%)
                5004: 1098100,  // NPP PR (7.75%)
                5005: 447286,   // TSP PR (3.16% - Failed 5% threshold)
                5006: 518921    // PFP PR (3.66% - Failed 5% threshold)
            },
            candidates: {
                5001: 6332168,  // DPP Constituency
                5002: 5633749,  // KMT Constituency
                5003: 264478,   // TPP Constituency
                5004: 141952,   // NPP Constituency
                5005: 141503,   // TSP Constituency
                5006: 60033     // PFP Constituency
            }
        },
        // Actual breakdown of the 79 majoritarian wins (73 Dist + 6 Indig)
        actualDistrictWins: {
            5001: 48, // 46 Dist + 2 Indig
            5002: 25, // 22 Dist + 3 Indig
            5003: 0,
            5004: 0,
            5005: 1,
            5006: 0
        },
        actualSeats: {
            5001: 61,  // 48 Dist + 13 PR
            5002: 38,  // 25 Dist + 13 PR
            5003: 5,   // 0 Dist + 5 PR
            5004: 3,   // 0 Dist + 3 PR
            5005: 1,   // 1 Dist + 0 PR
            5006: 0
        },
        specialSeats: { others: 5 }, // 5 Independents (mostly caucusing with DPP)
        finalParliamentSize: 113
    },
    "italy_2022": {
        name: "2022 Italian Legislative Election",
        description: "Right-wing coalition victory under the 'Rosatellum' parallel system. Absolute majority achieved despite 44% vote share due to dominant SMD performance. Total 400 seats.",
        system: "parallel",
        districtSeats: 147,      // Single-member districts (FPTP)
        baseListSeats: 245,      // Proportional list seats (excluding 8 abroad seats)
        threshold: 3,           // 3% for parties, 10% for coalitions
        allocationMethod: "dhondt",
        parties: [
            { id: 6001, name: "Brothers of Italy (FdI)", color: "#0047AB" },
            { id: 6002, name: "Democratic Party (PD)", color: "#EF3E3E" },
            { id: 6003, name: "Five Star Movement (M5S)", color: "#FEE000" },
            { id: 6004, name: "Lega (League)", color: "#008000" },
            { id: 6005, name: "Forza Italia (FI)", color: "#007FFF" },
            { id: 6006, name: "Action - Italia Viva (A-IV)", color: "#FF5F1F" },
            { id: 6007, name: "Greens and Left (AVS)", color: "#32CD32" },
            { id: 6008, name: "More Europe (+E)", color: "#FFD700" },
            { id: 6009, name: "Us Moderates (NM)", color: "#00FFFF" }
        ],
        candidates: [
            { id: 6001, name: "FdI Candidate", partyId: 6001 },
            { id: 6002, name: "PD Candidate", partyId: 6002 },
            { id: 6003, name: "M5S Candidate", partyId: 6003 },
            { id: 6004, name: "Lega Candidate", partyId: 6004 },
            { id: 6005, name: "FI Candidate", partyId: 6005 },
            { id: 6006, name: "A-IV Candidate", partyId: 6006 },
            { id: 6007, name: "AVS Candidate", partyId: 6007 },
            { id: 6008, name: "+E Candidate", partyId: 6008 },
            { id: 6009, name: "NM Candidate", partyId: 6009 }
        ],
        votes: {
            parties: {
                6001: 7302517,  // FdI PR (26.00%)
                6002: 5356180,  // PD PR (19.07%)
                6003: 4333972,  // M5S PR (15.43%)
                6004: 2464005,  // Lega PR (8.77%)
                6005: 2278217,  // FI PR (8.11%)
                6006: 2186669,  // A-IV PR (7.79%)
                6007: 1018669,  // AVS PR (3.63%)
                6008: 793925,   // +E PR (2.83% - Failed individual threshold)
                6009: 255505    // NM PR (0.91%)
            },
            candidates: {
                // Total coalition votes in SMDs are typically slightly higher/different
                // but the single-ballot law maps list votes to candidates directly.
                6001: 12300244, // Right Coalition (FdI + Lega + FI + NM)
                6002: 7337975,  // Left Coalition (PD + AVS + +E)
                6003: 4333972,  // M5S (Standalone)
                6006: 2186669   // A-IV (Standalone)
            }
        },
        // Total 147 District seats + 1 (Valle d'Aosta)
        actualDistrictWins: {
            6001: 49, // FdI (Assigned share of coalition wins)
            6004: 42, // Lega (Assigned share)
            6005: 23, // FI (Assigned share)
            6009: 7,  // NM (Assigned share)
            6002: 7,  // PD
            6007: 2,  // AVS
            6003: 10, // M5S
            6006: 0
        },
        actualSeats: {
            6001: 119, // 49 Dist + 69 PR + 1 Abroad
            6002: 69,  // 7 Dist + 57 PR + 5 Abroad
            6003: 52,  // 10 Dist + 41 PR + 1 Abroad
            6004: 66,  // 42 Dist + 23 PR + 1 Abroad
            6005: 45,  // 23 Dist + 22 PR
            6006: 21,  // 0 Dist + 21 PR
            6007: 12,  // 2 Dist + 10 PR
            6009: 7    // 7 Dist + 0 PR
        },
        specialSeats: { 
            abroad: 8,
            aosta: 1 
        },
        finalParliamentSize: 400
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
