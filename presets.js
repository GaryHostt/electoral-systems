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
    "uk_2015": {
        name: "2015 UK General Election",
        description: "Unexpected Conservative majority. Marked by the collapse of the Liberal Democrats and the SNP landslide in Scotland. Demonstrates extreme FPTP disproportionality for UKIP and the Greens.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 648,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 7001, name: "Conservative", color: "#0087DC" },
            { id: 7002, name: "Labour", color: "#DC241F" },
            { id: 7003, name: "UKIP", color: "#70147A" },
            { id: 7004, name: "Liberal Democrats", color: "#FDBB30" },
            { id: 7005, name: "SNP", color: "#FDF38E" },
            { id: 7006, name: "Green Party", color: "#6AB023" },
            { id: 7007, name: "Democratic Unionist (DUP)", color: "#D46A4C" },
            { id: 7008, name: "Sinn Féin", color: "#326760" },
            { id: 7009, name: "Plaid Cymru", color: "#008142" },
            { id: 7010, name: "SDLP", color: "#2AA82C" },
            { id: 7011, name: "Ulster Unionist (UUP)", color: "#48A5EE" }
        ],
        votes: {
            parties: {
                7001: 11299609, // Conservative (36.8%)
                7002: 9347273,  // Labour (30.4%)
                7003: 3881099,  // UKIP (12.6%)
                7004: 2415919,  // Lib Dem (7.9%)
                7005: 1454436,  // SNP (4.7%)
                7006: 1111603,  // Green (3.8%)
                7007: 184260,   // DUP (0.6%)
                7008: 176232,   // Sinn Féin (0.6%)
                7009: 181704,   // Plaid Cymru (0.6%)
                7010: 99809,    // SDLP (0.3%)
                7011: 114935    // UUP (0.4%)
            }
        },
        seats: {
            7001: 330, // Conservatives (Majority)
            7002: 232, // Labour
            7005: 56,  // SNP
            7004: 8,   // Liberal Democrats
            7007: 8,   // DUP
            7008: 4,   // Sinn Féin
            7009: 3,   // Plaid Cymru
            7010: 3,   // SDLP
            7011: 2,   // UUP
            7003: 1,   // UKIP
            7006: 1    // Green
        },
        specialSeats: {
            speaker: 1,
            independents: 1 // Sylvia Hermon (North Down)
        },
        finalParliamentSize: 650
    },
    "uk_2024": {
        name: "2024 UK General Election",
        description: "Landslide Labour victory despite only 33.8% of the vote. Reform UK wins 14.3% of votes but only 5 seats (0.8% of seats).",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 650,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 14001, name: "Labour Party", color: "#DC241F" },
            { id: 14002, name: "Conservative Party", color: "#0087DC" },
            { id: 14003, name: "Reform UK", color: "#12B6CF" },
            { id: 14004, name: "Liberal Democrats", color: "#FDBB30" },
            { id: 14005, name: "Green Party", color: "#6AB023" },
            { id: 14006, name: "SNP", color: "#FDF38E" },
            { id: 14007, name: "Sinn Féin", color: "#326760" },
            { id: 14008, name: "Democratic Unionist Party", color: "#D46A4C" },
            { id: 14009, name: "Plaid Cymru", color: "#008142" },
            { id: 14010, name: "Social Democratic and Labour Party", color: "#2AA82C" },
            { id: 14011, name: "Alliance", color: "#F6BE00" },
            { id: 14012, name: "Ulster Unionist Party", color: "#48A5EE" },
            { id: 14013, name: "Workers Party of Britain", color: "#CC0000" },
            { id: 14014, name: "Alba", color: "#FF4500" },
            { id: 14015, name: "Independent", color: "#808080" },
            { id: 14016, name: "Traditional Unionist Voice", color: "#0066CC" }
        ],
        votes: {
            parties: {
                14001: 9734054,  // 33.8% - Labour
                14002: 6828726,  // 23.7% - Conservative
                14003: 4117610,  // 14.3% - Reform UK
                14004: 3519214,  // 12.2% - Liberal Democrats
                14005: 1943804,  // 6.8% - Green
                14006: 724758,   // 2.5% - SNP
                14007: 210891,   // 0.7% - Sinn Féin
                14008: 172058,   // 0.6% - DUP
                14009: 194811,   // 0.7% - Plaid Cymru
                14010: 86861,    // 0.3% - SDLP
                14011: 117191,   // 0.4% - Alliance
                14012: 94779,    // 0.3% - UUP
                14013: 210252,   // 0.7% - Workers Party of Britain
                14014: 11784,    // 0.0% - Alba
                14015: 564042,   // Independent
                14016: 48685     // Traditional Unionist Voice
            }
        },
        seats: {
            14001: 412,  // Labour
            14002: 121,  // Conservative
            14004: 72,   // Liberal Democrats
            14006: 9,    // SNP
            14003: 5,    // Reform UK
            14005: 4,    // Green
            14007: 7,    // Sinn Féin
            14008: 5,    // DUP
            14009: 4,    // Plaid Cymru
            14010: 2,    // SDLP
            14011: 1,    // Alliance
            14012: 1,    // UUP
            14013: 0,    // Workers Party of Britain
            14014: 0,    // Alba
            14015: 6,    // Independent
            14016: 1     // Traditional Unionist Voice
        },
        specialSeats: {
            others: 0  // All seats now accounted for
        },
        finalParliamentSize: 650
    },
    "uk_2019": {
        name: "2019 UK General Election",
        description: "Boris Johnson's 'Get Brexit Done' victory. The Conservatives swept the 'Red Wall' to secure an 80-seat majority.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 650,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 15001, name: "Conservative Party", color: "#0087DC" },
            { id: 15002, name: "Labour Party", color: "#DC241F" },
            { id: 15003, name: "Liberal Democrats", color: "#FDBB30" },
            { id: 15004, name: "SNP", color: "#FDF38E" },
            { id: 15005, name: "Green Party", color: "#6AB023" },
            { id: 15006, name: "Brexit Party", color: "#12B6CF" }
        ],
        votes: {
            parties: {
                15001: 13966454, // 43.6%
                15002: 10269051, // 32.1%
                15003: 3696419,  // 11.5%
                15004: 1242380,  // 3.9%
                15005: 865715,   // 2.7%
                15006: 644257    // 2.0%
            }
        },
        seats: {
            15001: 365,
            15002: 202,
            15004: 48,
            15003: 11,
            15005: 1
        },
        specialSeats: {
            others: 23
        },
        finalParliamentSize: 650
    },
    "uk_2010": {
        name: "2010 UK General Election",
        description: "The first hung parliament since 1974. Lead to the Conservative-Liberal Democrat coalition. Liberal Democrats won 23% of votes but only 8.8% of seats. UKIP won 3.1% of votes but zero seats, demonstrating FPTP disproportionality.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 641,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 16001, name: "Conservative Party", color: "#0087DC" },
            { id: 16002, name: "Labour Party", color: "#DC241F" },
            { id: 16003, name: "Liberal Democrats", color: "#FDBB30" },
            { id: 16004, name: "SNP", color: "#FDF38E" },
            { id: 16005, name: "UKIP", color: "#70147A" },
            { id: 16006, name: "Sinn Féin", color: "#326760" },
            { id: 16007, name: "Plaid Cymru", color: "#008142" },
            { id: 16008, name: "Social Democratic & Labour Party", color: "#2AA82C" },
            { id: 16009, name: "Green Party", color: "#6AB023" },
            { id: 16010, name: "Alliance Party", color: "#F6BE00" },
            { id: 16011, name: "British National Party", color: "#000000" },
            { id: 16012, name: "Ulster Conservatives and Unionists - New Force", color: "#0047AB" },
            { id: 16013, name: "English Democrats", color: "#FF0000" },
            { id: 16014, name: "Respect-Unity Coalition", color: "#FF6600" },
            { id: 16015, name: "Traditional Unionist Voice", color: "#0066CC" },
            { id: 16016, name: "Christian Party", color: "#FFD700" },
            { id: 16017, name: "Independent Community and Health Concern", color: "#8B4513" },
            { id: 16018, name: "Trade Unionist and Socialist Coalition", color: "#CC0000" },
            { id: 16019, name: "Scottish Socialist Party", color: "#FF4500" },
            { id: 16020, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                16001: 10703654, // 36.1%
                16002: 8609527,  // 29.0%
                16003: 6836824,  // 23.0%
                16004: 491386,   // 1.7%
                16005: 919546,   // 3.1% - UKIP
                16006: 171942,   // 0.6% - Sinn Féin
                16007: 165394,   // 0.6% - Plaid Cymru
                16008: 110970,   // 0.4% - SDLP
                16009: 285616,   // 1.0% - Green
                16010: 42762,    // 0.1% - Alliance Party
                16011: 564331,   // 1.9% - BNP
                16012: 102361,   // 0.3% - UCUNF
                16013: 64826,    // 0.2% - English Democrats
                16014: 33251,    // 0.1% - Respect-Unity
                16015: 26300,    // 0.1% - TUV
                16016: 18623,    // 0.1% - Christian Party
                16017: 16150,    // 0.1% - ICHC
                16018: 12275,    // 0.0% - TUSC
                16019: 3157,     // 0.0% - SSP
                16020: 321309    // 1.1% - Others
            }
        },
        seats: {
            16001: 306,
            16002: 258,
            16003: 57,
            16004: 6,
            16005: 0,  // UKIP
            16006: 5,  // Sinn Féin
            16007: 3,  // Plaid Cymru
            16008: 3,  // SDLP
            16009: 1,  // Green
            16010: 1,  // Alliance Party
            16011: 0,  // BNP
            16012: 0,  // UCUNF
            16013: 0,  // English Democrats
            16014: 0,  // Respect-Unity
            16015: 0,  // TUV
            16016: 0,  // Christian Party
            16017: 0,  // ICHC
            16018: 0,  // TUSC
            16019: 0,  // SSP
            16020: 1   // Others
        },
        specialSeats: {
            others: 0  // All seats now accounted for in parties array
        },
        finalParliamentSize: 641
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
    "canada_2025": {
        name: "2025 Canadian Federal Election",
        description: "Mark Carney leads the Liberals to a fourth term minority government. Historic consolidation of the top two parties (85%+) while the NDP loses official party status. First election with 343 seats.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 343,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 8001, name: "Liberal Party", color: "#D71920" },
            { id: 8002, name: "Conservative Party", color: "#004770" },
            { id: 8003, name: "Bloc Québécois", color: "#0080C4" },
            { id: 8004, name: "New Democratic Party (NDP)", color: "#F37021" },
            { id: 8005, name: "Green Party", color: "#3D9B35" },
            { id: 8006, name: "People's Party (PPC)", color: "#1F2742" }
        ],
        votes: {
            parties: {
                8001: 8670000, // Liberal (43.8%) - Approximate based on final totals
                8002: 8185000, // Conservative (41.3%)
                8003: 1246000, // Bloc Québécois (6.3%)
                8004: 1246000, // NDP (6.3%)
                8005: 242000,  // Green (1.2%)
                8006: 139000   // PPC (0.7%)
            }
        },
        seats: {
            8001: 169, // Liberals (Strong Minority)
            8002: 144, // Conservatives (Official Opposition)
            8003: 22,  // Bloc Québécois
            8004: 7,   // NDP (Loss of official party status)
            8005: 1    // Green (Elizabeth May)
        },
        specialSeats: {
            independents: 0
        },
        finalParliamentSize: 343
    },
    "canada_2021": {
        name: "2021 Canadian Federal Election",
        description: "Trudeau's second minority government. Conservatives won the popular vote but fewer seats. The PPC took 5% of the vote but won zero seats.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 338,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 11001, name: "Liberal Party", color: "#D71920" },
            { id: 11002, name: "Conservative Party", color: "#004770" },
            { id: 11003, name: "New Democratic Party", color: "#F37021" },
            { id: 11004, name: "Bloc Québécois", color: "#0080C4" },
            { id: 11005, name: "People's Party (PPC)", color: "#1F2742" },
            { id: 11006, name: "Green Party", color: "#3D9B35" }
        ],
        votes: {
            parties: {
                11001: 5556629, // 32.6%
                11002: 5747410, // 33.7%
                11003: 3036348, // 17.8%
                11004: 1301615, // 7.6%
                11005: 840993,  // 4.9%
                11006: 396988   // 2.3%
            }
        },
        seats: {
            11001: 160,
            11002: 119,
            11004: 32,
            11003: 25,
            11006: 2
        },
        specialSeats: {
            independents: 0
        },
        finalParliamentSize: 338
    },
    "canada_2019": {
        name: "2019 Canadian Federal Election",
        description: "Liberals lose their majority but remain the largest party. Bloc Québécois experiences a major resurgence in Quebec. People's Party (PPC) won 1.6% of votes but zero seats, demonstrating FPTP disproportionality.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 338,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 12001, name: "Liberal Party", color: "#D71920" },
            { id: 12002, name: "Conservative Party", color: "#004770" },
            { id: 12003, name: "New Democratic Party", color: "#F37021" },
            { id: 12004, name: "Bloc Québécois", color: "#0080C4" },
            { id: 12005, name: "Green Party", color: "#3D9B35" },
            { id: 12006, name: "People's Party (PPC)", color: "#1F2742" },
            { id: 12007, name: "Other", color: "#999999" },
            { id: 12008, name: "Independent", color: "#808080" }
        ],
        votes: {
            parties: {
                12001: 5915950, // 33.1%
                12002: 6239227, // 34.3%
                12003: 2903722, // 16.0%
                12004: 1387030, // 7.6%
                12005: 1189631, // 6.5%
                12006: 292661,  // 1.6% - PPC (0 seats)
                12007: 66520,   // 0.4% - Other (0 seats)
                12008: 75827    // 0.4% - Independent (1 seat)
            }
        },
        seats: {
            12001: 157,
            12002: 121,
            12004: 32,
            12003: 24,
            12005: 3,
            12006: 0,  // PPC
            12007: 0,  // Other
            12008: 1   // Independent
        },
        specialSeats: {
            independents: 0  // Independent already counted in seats (12008: 1)
        },
        finalParliamentSize: 338
    },
    "canada_2011": {
        name: "2011 Canadian Federal Election",
        description: "Stephen Harper's first majority. The 'Orange Crush' saw the NDP become Official Opposition for the first time, while the Liberals fell to third place.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 308,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 13001, name: "Conservative Party", color: "#004770" },
            { id: 13002, name: "New Democratic Party", color: "#F37021" },
            { id: 13003, name: "Liberal Party", color: "#D71920" },
            { id: 13004, name: "Bloc Québécois", color: "#0080C4" },
            { id: 13005, name: "Green Party", color: "#3D9B35" }
        ],
        votes: {
            parties: {
                13001: 5835270, // 39.6%
                13002: 4508474, // 30.6%
                13003: 2783175, // 18.9%
                13004: 889788,  // 6.0%
                13005: 576221   // 3.9%
            }
        },
        seats: {
            13001: 166,
            13002: 103,
            13003: 34,
            13004: 4,
            13005: 1
        },
        specialSeats: {
            independents: 0
        },
        finalParliamentSize: 308
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
            { id: 3008, name: "Liberals", color: "#0069b4" },
            { id: 3009, name: "Nuance Party (PNy)", color: "#9B59B6" },
            { id: 3010, name: "Alternative for Sweden (AfS)", color: "#8B4513" },
            { id: 3011, name: "Citizens' Coalition (MED)", color: "#4682B4" },
            { id: 3012, name: "Pirate Party (PP)", color: "#FF6600" },
            { id: 3013, name: "Humanist Democracy [sv] (MD)", color: "#1ABC9C" },
            { id: 3014, name: "Christian Values Party [sv] (KRVP)", color: "#4169E1" },
            { id: 3015, name: "Knapptryckarna [sv] (Kn)", color: "#E67E22" },
            { id: 3016, name: "Feminist Initiative (FI)", color: "#FF69B4" },
            { id: 3017, name: "Independent Rural Party (LPo)", color: "#228B22" },
            { id: 3018, name: "Direct Democrats (DD)", color: "#32CD32" },
            { id: 3019, name: "Climate Alliance (KA)", color: "#00AA00" },
            { id: 3020, name: "Unity (ENH)", color: "#DC143C" },
            { id: 3021, name: "Communist Party of Sweden (SKP)", color: "#DC143C" }
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
                3008: 298542,   // Liberals
                3009: 28352,    // Nuance Party (PNy)
                3010: 16646,    // Alternative for Sweden (AfS)
                3011: 12882,    // Citizens' Coalition (MED)
                3012: 9135,     // Pirate Party (PP)
                3013: 6077,     // Humanist Democracy [sv] (MD)
                3014: 5983,     // Christian Values Party [sv] (KRVP)
                3015: 5493,     // Knapptryckarna [sv] (Kn)
                3016: 3157,     // Feminist Initiative (FI)
                3017: 2215,     // Independent Rural Party (LPo)
                3018: 1755,     // Direct Democrats (DD)
                3019: 1702,     // Climate Alliance (KA)
                3020: 1356,     // Unity (ENH)
                3021: 1181      // Communist Party of Sweden (SKP)
            }
        },
        actualSeats: {
            3001: 107,  // Social Democrats
            3002: 73,   // Sweden Democrats
            3003: 68,   // Moderate Party
            3004: 24,   // Left Party
            3005: 24,   // Centre Party
            3006: 19,   // Christian Democrats
            3007: 18,   // Green Party
            3008: 16,   // Liberals
            3009: 0,    // Nuance Party (PNy)
            3010: 0,    // Alternative for Sweden (AfS)
            3011: 0,    // Citizens' Coalition (MED)
            3012: 0,    // Pirate Party (PP)
            3013: 0,    // Humanist Democracy [sv] (MD)
            3014: 0,    // Christian Values Party [sv] (KRVP)
            3015: 0,    // Knapptryckarna [sv] (Kn)
            3016: 0,    // Feminist Initiative (FI)
            3017: 0,    // Independent Rural Party (LPo)
            3018: 0,    // Direct Democrats (DD)
            3019: 0,    // Climate Alliance (KA)
            3020: 0,    // Unity (ENH)
            3021: 0     // Communist Party of Sweden (SKP)
        },
        finalParliamentSize: 349
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
            { id: 3108, name: "Green Party", color: "#83cf39" },
            { id: 3109, name: "Feminist Initiative", color: "#FF69B4" },
            { id: 3110, name: "Alternative for Sweden", color: "#8B4513" },
            { id: 3111, name: "Citizens' Coalition", color: "#4682B4" },
            { id: 3112, name: "Pirate Party", color: "#FF6600" },
            { id: 3113, name: "Direct Democrats", color: "#32CD32" },
            { id: 3114, name: "Independent Rural Party", color: "#228B22" },
            { id: 3115, name: "Enhet", color: "#DC143C" },
            { id: 3116, name: "Animals' Party", color: "#00AA00" },
            { id: 3117, name: "Christian Values Party [sv]", color: "#4169E1" },
            { id: 3118, name: "Nordic Resistance Movement", color: "#2F4F4F" },
            { id: 3119, name: "Classical Liberal Party", color: "#FFD700" },
            { id: 3120, name: "Communist Party of Sweden", color: "#DC143C" },
            { id: 3121, name: "Basic Income Party", color: "#9370DB" },
            { id: 3122, name: "Initiative", color: "#20B2AA" }
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
                3108: 285899,   // Green Party - 4.41%
                3109: 29665,    // Feminist Initiative
                3110: 20290,    // Alternative for Sweden
                3111: 13056,    // Citizens' Coalition
                3112: 7326,     // Pirate Party
                3113: 5153,     // Direct Democrats
                3114: 4962,     // Independent Rural Party
                3115: 4647,     // Enhet
                3116: 3648,     // Animals' Party
                3117: 3202,     // Christian Values Party [sv]
                3118: 2106,     // Nordic Resistance Movement
                3119: 1504,     // Classical Liberal Party
                3120: 702,      // Communist Party of Sweden
                3121: 632,      // Basic Income Party
                3122: 615       // Initiative
            }
        },
        actualSeats: {
            3101: 100,  // Social Democrats
            3102: 70,   // Moderate Party
            3103: 62,   // Sweden Democrats
            3104: 31,   // Centre Party
            3105: 28,   // Left Party
            3106: 22,   // Christian Democrats
            3107: 20,   // Liberals
            3108: 16,   // Green Party
            3109: 0,    // Feminist Initiative
            3110: 0,    // Alternative for Sweden
            3111: 0,    // Citizens' Coalition
            3112: 0,    // Pirate Party
            3113: 0,    // Direct Democrats
            3114: 0,    // Independent Rural Party
            3115: 0,    // Enhet
            3116: 0,    // Animals' Party
            3117: 0,    // Christian Values Party [sv]
            3118: 0,    // Nordic Resistance Movement
            3119: 0,    // Classical Liberal Party
            3120: 0,    // Communist Party of Sweden
            3121: 0,    // Basic Income Party
            3122: 0     // Initiative
        },
        finalParliamentSize: 349
    },
    "germany_2021": {
        name: "2021 German Federal Election",
        description: "SPD victory, MMP with overhang seats and leveling. Note: The Left Party (4.9% - below 5% threshold) received full proportional representation because they won 3 direct mandates, demonstrating the 'Double Gate' rule.",
        system: "mmp",
        totalSeats: 736,
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
        totalSeats: 709,
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
            { id: 1006, name: "Alliance 90/The Greens", color: "#64A12D" },
            { id: 1007, name: "Free Voters", color: "#0066CC" },
            { id: 1008, name: "Die PARTEI", color: "#FF0000" },
            { id: 1009, name: "Human Environment Animal Protection Party", color: "#00AA00" },
            { id: 1010, name: "National Democratic Party", color: "#8B4513" },
            { id: 1011, name: "Pirate Party Germany", color: "#FF6600" },
            { id: 1012, name: "Ecological Democratic Party", color: "#00CC00" },
            { id: 1013, name: "Basic Income Alliance", color: "#9B59B6" },
            { id: 1014, name: "V-Partei3", color: "#E91E63" },
            { id: 1015, name: "German Centre [de]", color: "#34495E" },
            { id: 1016, name: "Democracy in Motion", color: "#1ABC9C" },
            { id: 1017, name: "Bavaria Party", color: "#F39C12" },
            { id: 1018, name: "Alliance of German Democrats", color: "#95A5A6" },
            { id: 1019, name: "Alliance for Human Rights, Animal and Nature Protection", color: "#27AE60" },
            { id: 1020, name: "Marxist–Leninist Party", color: "#C0392B" },
            { id: 1021, name: "Partei für Gesundheitsforschung", color: "#3498DB" },
            { id: 1022, name: "Menschliche Welt [de]", color: "#E67E22" },
            { id: 1023, name: "German Communist Party", color: "#E74C3C" }
        ],
        candidates: [
            { id: 1001, name: "CDU/CSU Candidate", partyId: 1001 },
            { id: 1002, name: "SPD Candidate", partyId: 1002 },
            { id: 1003, name: "AfD Candidate", partyId: 1003 },
            { id: 1004, name: "FDP Candidate", partyId: 1004 },
            { id: 1005, name: "The Left Candidate", partyId: 1005 },
            { id: 1006, name: "Alliance 90/The Greens Candidate", partyId: 1006 },
            { id: 1007, name: "Free Voters Candidate", partyId: 1007 },
            { id: 1008, name: "Die PARTEI Candidate", partyId: 1008 },
            { id: 1009, name: "Human Environment Animal Protection Party Candidate", partyId: 1009 },
            { id: 1010, name: "National Democratic Party Candidate", partyId: 1010 },
            { id: 1011, name: "Pirate Party Germany Candidate", partyId: 1011 },
            { id: 1012, name: "Ecological Democratic Party Candidate", partyId: 1012 },
            { id: 1014, name: "V-Partei3 Candidate", partyId: 1014 },
            { id: 1017, name: "Bavaria Party Candidate", partyId: 1017 },
            { id: 1019, name: "Alliance for Human Rights, Animal and Nature Protection Candidate", partyId: 1019 },
            { id: 1020, name: "Marxist–Leninist Party Candidate", partyId: 1020 },
            { id: 1021, name: "Partei für Gesundheitsforschung Candidate", partyId: 1021 },
            { id: 1022, name: "Menschliche Welt [de] Candidate", partyId: 1022 },
            { id: 1023, name: "German Communist Party Candidate", partyId: 1023 }
        ],
        votes: {
            parties: {
                1001: 15317344, // CDU/CSU
                1002: 9539381,  // SPD
                1003: 5878115,  // AfD
                1004: 4999449,  // FDP
                1005: 4297270,  // The Left
                1006: 4158400,  // Alliance 90/The Greens
                1007: 463292,   // Free Voters
                1008: 454349,   // Die PARTEI
                1009: 374179,   // Human Environment Animal Protection Party
                1010: 176020,   // National Democratic Party
                1011: 173476,   // Pirate Party Germany
                1012: 144809,   // Ecological Democratic Party
                1013: 97539,    // Basic Income Alliance
                1014: 64073,    // V-Partei3
                1015: 63203,   // German Centre [de]
                1016: 60914,    // Democracy in Motion
                1017: 58037,    // Bavaria Party
                1018: 41251,    // Alliance of German Democrats
                1019: 32221,    // Alliance for Human Rights, Animal and Nature Protection
                1020: 29785,    // Marxist–Leninist Party
                1021: 23404,    // Partei für Gesundheitsforschung
                1022: 11661,    // Menschliche Welt [de]
                1023: 11558     // German Communist Party
            },
            candidates: {
                1001: 17286238, // CDU/CSU (CDU: 14,030,751 + CSU: 3,255,487)
                1002: 11429231, // SPD
                1003: 5317499,  // AfD
                1004: 3249238,  // FDP
                1005: 3966637,  // The Left
                1006: 3717922,  // Alliance 90/The Greens
                1007: 589056,   // Free Voters
                1008: 245659,   // Die PARTEI
                1009: 22917,    // Human Environment Animal Protection Party
                1010: 45169,    // National Democratic Party
                1011: 93196,    // Pirate Party Germany
                1012: 166228,   // Ecological Democratic Party
                1014: 1201,     // V-Partei3
                1017: 62622,    // Bavaria Party
                1019: 6114,     // Alliance for Human Rights, Animal and Nature Protection
                1020: 35760,    // Marxist–Leninist Party
                1021: 1537,     // Partei für Gesundheitsforschung
                1022: 2205,     // Menschliche Welt [de]
                1023: 7517      // German Communist Party
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
        totalSeats: 465,
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
        totalSeats: 465,
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
        totalSeats: 122,
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
        totalSeats: 120,
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
        totalSeats: 113,
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
        totalSeats: 113,
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
    "germany_2013": {
        name: "2013 German Federal Election",
        description: "Angela Merkel's best result. The FDP (4.8%) fell just short of the 5% threshold, resulting in 15% of the total vote being 'wasted'.",
        system: "mmp",
        totalSeats: 631,
        districtSeats: 299,
        baseListSeats: 299,
        threshold: 5,
        bypassThreshold: 3,
        allocationMethod: "sainte-lague",
        enableOverhangSeats: true,
        enableFullCompensation: true,
        parties: [
            { id: 18001, name: "CDU/CSU", color: "#000000" },
            { id: 18002, name: "SPD", color: "#E3000F" },
            { id: 18003, name: "The Left", color: "#BE3075" },
            { id: 18004, name: "Greens", color: "#64A12D" },
            { id: 18005, name: "FDP", color: "#FFED00" },
            { id: 18006, name: "AfD", color: "#009EE0" },
            { id: 18007, name: "Pirate Party Germany", color: "#FF6600" },
            { id: 18008, name: "National Democratic Party", color: "#8B4513" },
            { id: 18009, name: "Free Voters", color: "#0066CC" },
            { id: 18010, name: "Human Environment Animal Protection Party", color: "#00AA00" },
            { id: 18011, name: "Ecological Democratic Party", color: "#00CC00" }
        ],
        candidates: [
            { id: 18001, name: "CDU/CSU Candidate", partyId: 18001 },
            { id: 18002, name: "SPD Candidate", partyId: 18002 },
            { id: 18003, name: "The Left Candidate", partyId: 18003 },
            { id: 18004, name: "Greens Candidate", partyId: 18004 },
            { id: 18007, name: "Pirate Party Germany Candidate", partyId: 18007 },
            { id: 18008, name: "National Democratic Party Candidate", partyId: 18008 },
            { id: 18009, name: "Free Voters Candidate", partyId: 18009 },
            { id: 18010, name: "Human Environment Animal Protection Party Candidate", partyId: 18010 },
            { id: 18011, name: "Ecological Democratic Party Candidate", partyId: 18011 }
        ],
        votes: {
            parties: {
                18001: 18165446, // 41.5%
                18002: 11252215, // 25.7%
                18003: 3755699,  // 8.6%
                18004: 3694057,  // 8.4%
                18005: 2083533,  // 4.8% (Failed threshold)
                18006: 2056985,  // 4.7% (Failed threshold)
                18007: 959177,   // Pirate Party Germany
                18008: 560828,   // National Democratic Party
                18009: 423977,   // Free Voters
                18010: 140366,   // Human Environment Animal Protection Party
                18011: 127088    // Ecological Democratic Party
            },
            candidates: {
                18001: 19777721,
                18002: 12843458,
                18003: 3585178,
                18004: 3180299,
                18007: 963623,  // Pirate Party Germany
                18008: 635135,  // National Democratic Party
                18009: 431640,  // Free Voters
                18010: 4437,    // Human Environment Animal Protection Party
                18011: 128209   // Ecological Democratic Party
            }
        },
        actualSeats: {
            18001: 311,
            18002: 193,
            18003: 64,
            18004: 63
        },
        finalParliamentSize: 631
    },
    "italy_2022": {
        name: "2022 Italian Legislative Election",
        description: "Right-wing coalition victory under the 'Rosatellum' parallel system. Absolute majority achieved despite 44% vote share due to dominant SMD performance. Total 400 seats.",
        system: "parallel",
        totalSeats: 400,
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
    "italy_2018": {
        name: "2018 Italian Legislative Election",
        description: "Inaugural election for the Rosatellum system. The Five Star Movement was the largest single party, while the Center-Right was the largest coalition.",
        system: "parallel",
        totalSeats: 630,
        districtSeats: 232,
        baseListSeats: 386,
        threshold: 3,
        allocationMethod: "dhondt",
        parties: [
            { id: 17001, name: "Five Star Movement", color: "#FEE000" },
            { id: 17002, name: "Lega", color: "#008000" },
            { id: 17003, name: "Democratic Party", color: "#EF3E3E" },
            { id: 17004, name: "Forza Italia", color: "#007FFF" },
            { id: 17005, name: "Brothers of Italy", color: "#0047AB" },
            { id: 17006, name: "Free and Equal", color: "#A73F24" }
        ],
        votes: {
            parties: {
                17001: 10732066, // M5S (32.68%)
                17002: 5698687,  // Lega (17.37%)
                17003: 6161896,  // PD (18.76%)
                17004: 4596956,  // FI (14.01%)
                17005: 1429550,  // FdI (4.35%)
                17006: 1114799   // LeU (3.39%)
            },
            candidates: {
                // Aggregated by coalition candidates
                17002: 12152045, // Center-Right Coalition (Lega + FI + FdI + Noi con l'Italia)
                17001: 10732066, // M5S (Standalone)
                17003: 7506723,  // Center-Left Coalition (PD + +Europa + others)
                17006: 1114799,  // LeU (Standalone)
                17004: 0,        // (Tallied under 17002)
                17005: 0         // (Tallied under 17002)
            }
        },
        actualDistrictWins: {
            17001: 93,
            17002: 73,
            17003: 21,
            17004: 46,
            17005: 12
        },
        actualSeats: {
            17001: 227,
            17002: 125,
            17003: 112,
            17004: 104,
            17005: 32,
            17006: 14
        },
        specialSeats: {
            others: 16
        },
        finalParliamentSize: 630
    },
    "israel_2022": {
        name: "2022 Israeli Legislative Election",
        description: "Single national constituency with 3.25% threshold. Meretz (3.16%) and Balad (2.91%) failed threshold, resulting in ~6% wasted votes that helped Netanyahu secure majority.",
        system: "party-list",
        totalSeats: 120,
        threshold: 3.25,
        allocationMethod: "dhondt",
        parties: [
            { id: 8001, name: "Likud", color: "#005EB8" },
            { id: 8002, name: "Yesh Atid", color: "#50C8ED" },
            { id: 8003, name: "Religious Zionist Party", color: "#FF8000" },
            { id: 8004, name: "National Unity", color: "#0047AB" },
            { id: 8005, name: "Shas", color: "#000000" },
            { id: 8006, name: "Meretz", color: "#00B294" },
            { id: 8007, name: "Balad", color: "#FFA500" },
            { id: 8008, name: "United Torah Judaism", color: "#000080" },
            { id: 8009, name: "Yisrael Beiteinu", color: "#C41E3A" },
            { id: 8010, name: "United Arab List (Ra'am)", color: "#009639" },
            { id: 8011, name: "Hadash-Ta'al", color: "#FF0000" },
            { id: 8012, name: "Labor Party", color: "#E50000" },
            { id: 8013, name: "Others (Non-Qualifying)", color: "#999999" }
        ],
        votes: {
            parties: {
                8001: 1115336,  // Likud
                8002: 847435,   // Yesh Atid
                8003: 516470,   // Religious Zionist
                8004: 432482,   // National Unity
                8005: 392964,   // Shas
                8008: 280194,   // UTJ
                8009: 213687,   // Yisrael Beiteinu
                8010: 194047,   // Ra'am
                8011: 178735,   // Hadash-Ta'al
                8012: 175992,   // Labor
                8006: 150793,   // Meretz (3.16% - Qualifies if threshold lowered)
                8007: 138617,   // Balad (2.91% - Qualifies if threshold lowered)
                8013: 124000    // Aggregate of all other tiny parties (<1%)
            }
        },
        actualSeats: {
            8001: 32,
            8002: 24,
            8003: 14,
            8005: 11,
            8004: 12,
            8008: 7,
            8009: 6,
            8010: 5,
            8011: 5,
            8012: 4
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
        },
        actualSeats: {
            8101: 30,  // Likud
            8102: 17,  // Yesh Atid
            8103: 9,   // Shas
            8104: 8,   // Blue and White
            8105: 7,   // Yamina
            8106: 7,   // Labor Party
            8107: 7,   // United Torah Judaism
            8108: 7,   // Yisrael Beiteinu
            8109: 6,   // Religious Zionist Party
            8110: 6,   // Joint List
            8111: 6,   // New Hope
            8112: 6,   // Meretz
            8113: 4    // United Arab List (Ra'am)
        },
        finalParliamentSize: 120
    },
    "netherlands_2023": {
        name: "2023 Netherlands General Election",
        description: "Extremely low threshold (0.67% for one seat) leading to high party fragmentation. Record 17 parties enter parliament. PVV and D66 tie for largest party with 26 seats each.",
        system: "party-list",
        totalSeats: 150,
        threshold: 0.67,
        allocationMethod: "hare",
        parties: [
            { id: 9001, name: "Democrats 66 (D66)", color: "#00A7E1" },
            { id: 9002, name: "Party for Freedom (PVV)", color: "#1C4788" },
            { id: 9003, name: "People's Party for Freedom and Democracy (VVD)", color: "#FF7F00" },
            { id: 9004, name: "Coalition Labour Party-Green Left (PvdA-GL)", color: "#B40D1E" },
            { id: 9005, name: "Christian Democrat Appeal (CDA)", color: "#00A651" },
            { id: 9006, name: "Correct Answer 2021 (JA 21)", color: "#FFD700" },
            { id: 9007, name: "Forum for Democracy (FvD)", color: "#800020" },
            { id: 9008, name: "Farmers – Citizens Movement (BBB)", color: "#92D050" },
            { id: 9009, name: "Denk (DENK)", color: "#FF6B35" },
            { id: 9010, name: "Reformed Political Party (SGP)", color: "#0066CC" },
            { id: 9011, name: "Party for Animals (PvdD)", color: "#8B4513" },
            { id: 9012, name: "Christian Union (CU)", color: "#0066FF" },
            { id: 9013, name: "Socialist Party (SP)", color: "#FF0000" },
            { id: 9014, name: "50 +", color: "#FF69B4" },
            { id: 9015, name: "Volt", color: "#502379" },
            { id: 9016, name: "New Social Contract (NSC)", color: "#00CED1" },
            { id: 9017, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                9001: 1767721,  // D66 - 16.89%
                9002: 1753640,  // PVV - 16.75%
                9003: 1491089,  // VVD - 14.24%
                9004: 1324521,  // PvdA-GL - 12.67%
                9005: 1234425,  // CDA - 11.79%
                9006: 622469,   // JA 21 - 5.95%
                9007: 476587,   // FvD - 4.55%
                9008: 278561,   // BBB - 2.66%
                9009: 252595,   // DENK - 2.42%
                9010: 237606,   // SGP - 2.28%
                9011: 200074,   // PvdD - 2.06%
                9012: 215176,   // CU - 1.92%
                9013: 197872,   // SP - 1.89%
                9014: 150587,   // 50+ - 1.44%
                9015: 112515,   // Volt - 1.08%
                9016: 39286,    // NSC - 0.38%
                9017: 110903    // Others - 1.03%
            }
        },
        actualSeats: {
            9001: 26,  // D66
            9002: 26,  // PVV
            9003: 22,  // VVD
            9004: 20,  // PvdA-GL
            9005: 18,  // CDA
            9006: 9,   // JA 21
            9007: 7,   // FvD
            9008: 4,   // BBB
            9009: 3,   // DENK
            9010: 3,   // SGP
            9011: 3,   // PvdD
            9012: 3,   // CU
            9013: 3,   // SP
            9014: 2,   // 50+
            9015: 1,   // Volt
            9016: 0,   // NSC
            9017: 0    // Others
        }
    },
    "netherlands_2021": {
        name: "2021 Netherlands General Election",
        description: "VVD remains largest party with 21.91%. Record 17 parties enter parliament. D66 gains significantly to become second-largest party. Rutte forms fourth coalition government.",
        system: "party-list",
        totalSeats: 150,
        threshold: 0.67,
        allocationMethod: "hare",
        parties: [
            { id: 9101, name: "People's Party for Freedom and Democracy (VVD)", color: "#FF7F00" },
            { id: 9102, name: "Democrats 66 (D66)", color: "#00A7E1" },
            { id: 9103, name: "Party for Freedom (PVV)", color: "#1C4788" },
            { id: 9104, name: "Christian Democratic Appeal (CDA)", color: "#00A651" },
            { id: 9105, name: "Socialist Party (SP)", color: "#FF0000" },
            { id: 9106, name: "Labour Party (PvdA)", color: "#B40D1E" },
            { id: 9107, name: "Green Left (GL)", color: "#73BF43" },
            { id: 9108, name: "Forum for Democracy (FvD)", color: "#800020" },
            { id: 9109, name: "Party for the Animals (PvdD)", color: "#8B4513" },
            { id: 9110, name: "Christian Union (CU)", color: "#0066CC" },
            { id: 9111, name: "Volt Nederland", color: "#502379" },
            { id: 9112, name: "Juiste Antwoord 2021 (JA21)", color: "#1E3A8A" },
            { id: 9113, name: "Political Reform Party (SGP)", color: "#0066CC" },
            { id: 9114, name: "Denk", color: "#FFD700" },
            { id: 9115, name: "50 Plus", color: "#FF6B6B" },
            { id: 9116, name: "Farmers-Citizens' Movement (BBB)", color: "#92D050" },
            { id: 9117, name: "Bij1", color: "#000000" },
            { id: 9118, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                9101: 2249988,  // VVD - 21.91%
                9102: 1535624,  // D66 - 14.95%
                9103: 1116037,  // PVV - 10.87%
                9104: 981867,   // CDA - 9.56%
                9105: 617746,   // SP - 6.01%
                9106: 585630,   // PvdA - 5.70%
                9107: 520994,   // GL - 5.07%
                9108: 516723,   // FvD - 5.03%
                9109: 391166,   // PvdD - 3.81%
                9110: 347898,   // CU - 3.39%
                9111: 245632,   // Volt - 2.39%
                9112: 243669,   // JA21 - 2.37%
                9113: 214830,   // SGP - 2.09%
                9114: 204969,   // Denk - 2.00%
                9115: 105571,   // 50 Plus - 1.03%
                9116: 103526,   // BBB - 1.01%
                9117: 83601,    // Bij1 - 0.81%
                9118: 204779    // Others - 1.99%
            }
        },
        actualSeats: {
            9101: 34,  // VVD
            9102: 24,  // D66
            9103: 17,  // PVV
            9104: 15,  // CDA
            9105: 9,   // SP
            9106: 9,   // PvdA
            9107: 8,   // GL
            9108: 8,   // FvD
            9109: 6,   // PvdD
            9110: 5,   // CU
            9111: 3,   // Volt
            9112: 3,   // JA21
            9113: 3,   // SGP
            9114: 3,   // Denk
            9115: 1,   // 50 Plus
            9116: 1,   // BBB
            9117: 1,   // Bij1
            9118: 0    // Others
        },
        finalParliamentSize: 150
    },
    "maine_2018_cd2": {
        name: "2018 Maine 2nd District Election",
        description: "The first federal election decided by RCV. Bruce Poliquin (R) led in the first round (46.3% vs 45.6%), but Jared Golden (D) won after the redistribution of votes from independent candidates Bond and Hoar.",
        system: "irv",
        totalSeats: 1,
        totalVoters: 289604,
        parties: [
            { id: 5201, name: "Democratic", color: "#0015BC" },
            { id: 5202, name: "Republican", color: "#E81B23" },
            { id: 5203, name: "Independent (Bond)", color: "#999999" },
            { id: 5204, name: "Independent (Hoar)", color: "#666666" }
        ],
        candidates: [
            { id: 5201, name: "Jared Golden", partyId: 5201 },
            { id: 5202, name: "Bruce Poliquin", partyId: 5202 },
            { id: 5203, name: "Tiffany Bond", partyId: 5203 },
            { id: 5204, name: "Will Hoar", partyId: 5204 }
        ],
        ballots: [
            { preferences: [5201], percentage: 45.58, name: "Golden core" },
            { preferences: [5202], percentage: 46.33, name: "Poliquin core" },
            { preferences: [5203, 5201], percentage: 4.10, name: "Bond to Golden" },
            { preferences: [5203, 5202], percentage: 1.00, name: "Bond to Poliquin" },
            { preferences: [5203], percentage: 0.61, name: "Bond exhausted" },
            { preferences: [5204, 5201], percentage: 1.20, name: "Hoar to Golden" },
            { preferences: [5204, 5202], percentage: 0.80, name: "Hoar to Poliquin" },
            { preferences: [5204], percentage: 0.38, name: "Hoar exhausted" }
        ]
    },
    "us_house_2012": {
        name: "2012 US House of Representatives Election",
        description: "A classic example of an 'election inversion' in a majoritarian system. Despite Democratic candidates winning the national popular vote by 1.1%, the Republican Party won a significant majority of 234 seats. Demonstrates the impact of geographic sorting and district boundaries in FPTP systems.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 435,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 12001, name: "Republican Party", color: "#E81B23" },
            { id: 12002, name: "Democratic Party", color: "#0015BC" },
            { id: 12003, name: "Libertarian Party", color: "#FED105" },
            { id: 12004, name: "Green Party", color: "#17AA5C" },
            { id: 12005, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                12001: 58228253, // 47.6% (Popular Vote second)
                12002: 59645531, // 48.8% (Popular Vote winner)
                12003: 1330230,  // 1.1%
                12004: 367000,   // 0.3%
                12005: 2700000   // Aggregate for Ind/Misc
            }
        },
        seats: {
            12001: 234, // Republicans (Hold majority)
            12002: 201, // Democrats (Minority)
            12003: 0,
            12004: 0,
            12005: 0
        },
        finalParliamentSize: 435
    },
    "us_house_1952": {
        name: "1952 US House Election",
        description: "Coattail Inversion. Despite Eisenhower's landslide victory, House Democrats narrowly won the popular vote due to safe seats in the 'Solid South', while Republicans captured the majority of seats.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 435,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 5201, name: "Democratic Party", color: "#0015BC" },
            { id: 5202, name: "Republican Party", color: "#E81B23" },
            { id: 5203, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                5201: 28642537, // 49.7%
                5202: 28393794, // 49.3%
                5203: 563601
            }
        },
        seats: {
            5201: 213,
            5202: 221,
            5203: 1
        },
        finalParliamentSize: 435
    },
    "us_house_1942": {
        name: "1942 US House Election",
        description: "War-time Inversion. Midterm voters favored Republicans nationwide (+2.0%), but the Democratic incumbency and geographic efficiency allowed them to retain a 13-seat majority.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 435,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 4201, name: "Republican Party", color: "#E81B23" },
            { id: 4202, name: "Democratic Party", color: "#0015BC" },
            { id: 4203, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                4201: 14217145, // 50.6%
                4202: 13331245, // 47.4%
                4203: 551600
            }
        },
        seats: {
            4201: 209,
            4202: 222,
            4203: 4
        },
        finalParliamentSize: 435
    },
    "us_house_1916": {
        name: "1916 US House Election",
        description: "Triple Inversion. Republicans won a clear popular vote plurality (+3.1%), but Democrats won more seats. Because neither reached 218, Democrats formed a coalition with minor parties to hold the speakership.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 435,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 1601, name: "Republican Party", color: "#E81B23" },
            { id: 1602, name: "Democratic Party", color: "#0015BC" },
            { id: 1603, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                1601: 8081622, // 48.4%
                1602: 7523912, // 45.1%
                1603: 1094000
            }
        },
        seats: {
            1601: 210,
            1602: 214,
            1603: 11
        },
        finalParliamentSize: 435
    },
    "us_house_1888": {
        name: "1888 US House Election",
        description: "Total System Inversion. Democrats won the popular vote for both the Presidency and the House, yet lost both due to geographic efficiency. Republicans took a 3-seat House majority with 4% less of the popular vote.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 325,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 8801, name: "Democratic Party", color: "#0015BC" },
            { id: 8802, name: "Republican Party", color: "#E81B23" },
            { id: 8803, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                8801: 5414378, // 49.6%
                8802: 4978452, // 45.6%
                8803: 520000
            }
        },
        seats: {
            8801: 161,
            8802: 164,
            8803: 0
        },
        finalParliamentSize: 325
    },
    "us_house_1848": {
        name: "1848 US House Election",
        description: "Three-Party Disruption. The Free Soil Party split the anti-slavery vote. Democrats won the popular vote plurality, but the Whigs won the most seats, resulting in a chaotic hung parliament where neither major party held 116 seats.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 231,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 4801, name: "Whig Party", color: "#F5F5DC" },
            { id: 4802, name: "Democratic Party", color: "#0015BC" },
            { id: 4803, name: "Free Soil Party", color: "#17AA5C" }
        ],
        votes: {
            parties: {
                4801: 1100000, // ~45.3%
                4802: 1175000, // ~48.4%
                4803: 150000  // ~6.2%
            }
        },
        seats: {
            4801: 116,
            4802: 113,
            4803: 2
        },
        finalParliamentSize: 231
    },
    "us_house_1842": {
        name: "1842 US House Election",
        description: "The 'Antebellum Anomaly'. Whigs won the popular vote plurality (48.7%) but the Democrats won a massive 147-seat majority to the Whigs' 72. This 20% seat-to-vote disparity is one of the highest in US history.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 223,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 4201, name: "Whig Party", color: "#F5F5DC" },
            { id: 4202, name: "Democratic Party", color: "#0015BC" },
            { id: 4203, name: "Liberty Party", color: "#FED105" },
            { id: 4204, name: "Law and Order", color: "#8B4513" },
            { id: 4205, name: "Independent", color: "#808080" }
        ],
        votes: {
            parties: {
                4201: 960000,  // ~48.7%
                4202: 935000,  // ~47.5%
                4203: 75000,   // ~3.8%
                4204: 7145,    // Law and Order
                4205: 42236    // Independent
            }
        },
        seats: {
            4201: 72,
            4202: 147,
            4203: 0,
            4204: 2,  // Law and Order
            4205: 2   // Independent
        },
        finalParliamentSize: 223
    },
    "uk_1951": {
        name: "1951 UK General Election",
        description: "The ultimate UK inversion. Labour won the highest popular vote share in its history (48.8%) but lost to Winston Churchill's Conservatives (48.0%), who won 26 more seats. Demonstrates how 'piling up' votes in safe industrial seats is inefficient in FPTP.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 625,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 5101, name: "Labour Party", color: "#E4003B" },
            { id: 5102, name: "Conservative Party", color: "#0087DC" },
            { id: 5103, name: "Liberal Party", color: "#FAA61A" },
            { id: 5104, name: "Others", color: "#999999" }
        ],
        votes: {
            parties: {
                5101: 13948883, // 48.8%
                5102: 13717852, // 48.0%
                5103: 730546,   // 2.5%
                5104: 171942    // 0.7%
            }
        },
        seats: {
            5101: 295,
            5102: 321,
            5103: 6,
            5104: 3
        },
        finalParliamentSize: 625
    },
    "uk_1974_feb": {
        name: "1974 (Feb) UK General Election",
        description: "A rare 'Hung Parliament' inversion. Edward Heath's Conservatives won the popular vote by 0.7% (approx. 226,000 votes), but Harold Wilson's Labour Party won 4 more seats and formed a minority government.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 635,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 7401, name: "Conservative Party", color: "#0087DC" },
            { id: 7402, name: "Labour Party", color: "#E4003B" },
            { id: 7403, name: "Liberal Party", color: "#FAA61A" },
            { id: 7404, name: "SNP", color: "#FDF38E" },
            { id: 7405, name: "Others/Northern Ireland", color: "#999999" }
        ],
        votes: {
            parties: {
                7401: 11872180, // 37.9%
                7402: 11645616, // 37.2%
                7403: 6063470,  // 19.3%
                7404: 633323,   // 2.0%
                7405: 1100000   // Aggregate
            }
        },
        seats: {
            7401: 297,
            7402: 301,
            7403: 14,
            7404: 7,
            7405: 16
        },
        finalParliamentSize: 635
    },
    "canada_1979": {
        name: "1979 Canadian Federal Election",
        description: "Pierre Trudeau's Liberals won the popular vote by over 4%, yet Joe Clark's Progressive Conservatives formed a minority government. This was driven by Liberal concentration in Quebec and PC dominance in the West.",
        system: "fptp",
        raceType: "legislative",
        totalSeats: 282,
        threshold: 0,
        allocationMethod: "plurality",
        parties: [
            { id: 7901, name: "Liberal Party", color: "#D71920" },
            { id: 7902, name: "Progressive Conservative", color: "#004770" },
            { id: 7903, name: "New Democratic Party", color: "#F37021" },
            { id: 7904, name: "Social Credit", color: "#28C8C8" }
        ],
        votes: {
            parties: {
                7901: 4638358, // 40.1%
                7902: 4111606, // 35.9%
                7903: 2048988, // 17.9%
                7904: 527604   // 4.6%
            }
        },
        seats: {
            7901: 114,
            7902: 136,
            7903: 26,
            7904: 6
        },
        finalParliamentSize: 282
    },
    "australia_senate_qld_2022": {
        name: "2022 Australian Senate - Queensland (STV)",
        description: "A 6-seat multi-member district using Single Transferable Vote. This election illustrates the 'Droop Quota' (approx. 14.3%). The Liberal National Party and Labor each secured enough quotas for 2 seats, while the Greens and One Nation won the final two through preference flows.",
        system: "stv",
        totalSeats: 6,
        quotaType: "droop",
        totalVoters: 3000000,
        parties: [
            { id: 2201, name: "Liberal National Party", color: "#0047AB" },
            { id: 2202, name: "Labor Party", color: "#E4003B" },
            { id: 2203, name: "The Greens", color: "#009C3D" },
            { id: 2204, name: "One Nation", color: "#F58220" },
            { id: 2205, name: "Legalise Cannabis", color: "#4B2E83" },
            { id: 2206, name: "United Australia Party", color: "#FFFF00" }
        ],
        candidates: [
            { id: 22011, name: "LNP Candidate 1", partyId: 2201 },
            { id: 22012, name: "LNP Candidate 2", partyId: 2201 },
            { id: 22021, name: "Labor Candidate 1", partyId: 2202 },
            { id: 22022, name: "Labor Candidate 2", partyId: 2202 },
            { id: 22031, name: "Greens Candidate 1", partyId: 2203 },
            { id: 22041, name: "One Nation Candidate 1", partyId: 2204 },
            { id: 22051, name: "Cannabis Candidate 1", partyId: 2205 },
            { id: 22061, name: "UAP Candidate 1", partyId: 2206 }
        ],
        ballots: [
            { preferences: ["2201"], percentage: 35.1, name: "LNP Core (2.4 quotas)" },
            { preferences: ["2202"], percentage: 29.8, name: "Labor Core (2.1 quotas)" },
            { preferences: ["2203"], percentage: 12.5, name: "Greens Core (0.9 quotas)" },
            { preferences: ["2204"], percentage: 8.5, name: "One Nation Core (0.6 quotas)" },
            { preferences: ["2205", "2203"], percentage: 5.5, name: "Legalise Cannabis (Flows to Greens)" },
            { preferences: ["2206", "2204"], percentage: 3.1, name: "UAP (Flows to One Nation)" },
            { preferences: ["2204", "2201"], percentage: 5.5, name: "Independents (One Nation leaning)" }
        ],
        actualSeats: {
            2201: 2,
            2202: 2,
            2203: 1,
            2204: 1
        }
    },
    "iceland_2024": {
        name: "2024 Icelandic Parliamentary Election",
        description: "A demonstration of the 5% threshold and multi-member districts with leveling seats. The incumbent coalition collapsed, leading to a surge for the Social Democrats and the Liberal Reform Party. The Left-Green Movement, previously holding the Prime Ministership, fell below the threshold.",
        system: "party-list",
        totalSeats: 63,
        threshold: 5,
        allocationMethod: "dhondt",
        parties: [
            { id: 2401, name: "Social Democratic Alliance (S)", color: "#ed1b34" },
            { id: 2402, name: "Independence Party (D)", color: "#005ea1" },
            { id: 2403, name: "Liberal Reform Party (C)", color: "#ff7d00" },
            { id: 2404, name: "People's Party (F)", color: "#ffcc00" },
            { id: 2405, name: "Centre Party (M)", color: "#002d5e" },
            { id: 2406, name: "Progressive Party (B)", color: "#009c3d" },
            { id: 2407, name: "Left-Green Movement (V)", color: "#487005" },
            { id: 2408, name: "Pirate Party (P)", color: "#000000" },
            { id: 2409, name: "Socialist Party (J)", color: "#af0000" }
        ],
        votes: {
            parties: {
                2401: 42423, // 20.8%
                2402: 39635, // 19.4%
                2403: 32135, // 15.8%
                2404: 28140, // 13.8%
                2405: 25750, // 12.6%
                2406: 11833, // 5.8%
                2407: 7103,  // 3.5% (Failed threshold)
                2408: 6703,  // 3.3% (Failed threshold)
                2409: 6634   // 3.3% (Failed threshold)
            }
        },
        actualSeats: {
            2401: 15,
            2402: 14,
            2403: 11,
            2404: 10,
            2405: 9,
            2406: 4,
            2407: 0,
            2408: 0,
            2409: 0
        }
    }
};
