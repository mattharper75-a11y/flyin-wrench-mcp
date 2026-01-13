# MARCUS AUDIT: Flyin' Wrench Dashboard
## 73 Pages Reviewed Against Shop Owner Criteria

**Date:** January 12, 2026
**Auditor:** Skynet (Claude Code)
**Requested By:** Matt Harper via Claude Web

---

## Marcus's Mandate

> "I've been running shops for 20 years. I don't care how pretty it looks or how clever the code is. Does this page help me sell more labor? Does it help me catch a missed opportunity? Does it get cars out faster? If the answer is no, it's costing me money every time someone clicks on it instead of doing real work."

### Evaluation Criteria
1. **SELL MORE LABOR** - Does it drive GP?
2. **CATCH MISSED OPPORTUNITIES** - Does it recover declined work?
3. **GET CARS OUT FASTER** - Does it improve efficiency?

---

# SECTION 1: KEEP (23 Pages)
*These directly impact GP, efficiency, or accountability*

## Tier 1: Mission Critical (8 pages)
| Page | Purpose | Marcus Score |
|------|---------|--------------|
| **the-board.ejs** | Tech board - RO management, job assignment, status tracking | 10/10 - Core operations |
| **daily-gp.ejs** | Real-time GP tracking with pacing indicators | 10/10 - Money tracker |
| **score-card.ejs** | Store KPIs, daily numbers, employee performance | 10/10 - Accountability |
| **follow-up-queue.ejs** | Declined work follow-up with urgency flags | 10/10 - Money recovery |
| **check-in.ejs** | Customer intake, appointment flow | 9/10 - First impression |
| **shop-dashboard.ejs** | Store overview, quick stats | 9/10 - Command center |
| **speed-metrics.ejs** | Cycle time, efficiency tracking | 9/10 - Get cars out faster |
| **my-scorecard.ejs** | Individual tech/advisor performance | 9/10 - Personal accountability |

## Tier 2: Important Operations (9 pages)
| Page | Purpose | Marcus Score |
|------|---------|--------------|
| **employees.ejs** | Staff roster, contact info | 8/10 - Need to know who's working |
| **workstations.ejs** | Bay status, capacity view | 8/10 - Shop floor visibility |
| **workstation-detail.ejs** | Individual bay detail | 8/10 - Bay management |
| **schedule.ejs** | Staff scheduling | 8/10 - Know who's here |
| **shop-reports.ejs** | Sales/performance reports | 8/10 - Track trends |
| **employee-profile.ejs** | Individual employee view | 7/10 - Quick reference |
| **crm.ejs** | Customer relationship management | 7/10 - If used for callbacks |
| **marketing.ejs** | Marketing dashboard | 7/10 - If tied to ROI |
| **analytics.ejs** | Data analytics | 7/10 - If actionable |

## Tier 3: Necessary Admin (6 pages)
| Page | Purpose | Marcus Score |
|------|---------|--------------|
| **login.ejs** | Login page | Required |
| **home.ejs** | Landing page | Required |
| **settings.ejs** | Main settings | Required |
| **forgot-password.ejs** | Password reset | Required |
| **reset-password.ejs** | Password reset flow | Required |
| **layout.ejs** | Page template | Required |

---

# SECTION 2: CUT OR MERGE (35 Pages)
*These are redundant, unused, or "nice to have" clutter*

## IMMEDIATE CUT (7 pages)
| Page | Reason | Action |
|------|--------|--------|
| **secret-game.ejs** | Space Invaders game - Fun but NOT GP | DELETE |
| **meal-planner.ejs** | Nutrition/diet tracker - NOT AUTO SHOP | DELETE |
| **dev-upload.ejs** | Developer tool only | HIDE/DELETE |
| **feature-requests.ejs** | Internal dev tool | MOVE TO GITHUB |
| **cpanel.ejs** | Admin control panel - redundant | MERGE into admin-settings |
| **site-ui-images.ejs** | UI asset management | MERGE or DELETE |
| **legal.ejs** | Legal docs - rarely accessed | MOVE TO FOOTER LINK |

## MERGE: Settings Pages (9 pages → 1)
*Currently: 9 separate settings pages. Should be: 1 settings page with tabs*

| Current Pages | Merge Into |
|--------------|------------|
| settings.ejs | **settings.ejs** (single hub) |
| settings-users.ejs | Tab: Users |
| settings-users-edit.ejs | Modal in Users tab |
| settings-users-new.ejs | Modal in Users tab |
| settings-users-permissions.ejs | Tab: Permissions |
| settings-stores.ejs | Tab: Stores |
| settings-forms.ejs | Tab: Forms |
| settings-training-approvals.ejs | Tab: Training |
| store-settings.ejs | MERGE with settings-stores |
| site-settings.ejs | MERGE with admin-settings |
| admin-settings.ejs | Tab: Admin |
| shop-goals.ejs | Tab: Goals |

## MERGE: Training Pages (8 pages → 1)
*Currently: 8 training pages scattered. Should be: 1 training hub*

| Current Pages | Merge Into |
|--------------|------------|
| training.ejs | **training.ejs** (hub) |
| training-how-to-videos.ejs | Tab: Videos |
| training-onboarding-videos.ejs | Tab: Onboarding |
| training-new-hire.ejs | Tab: New Hire |
| training-safe-cash.ejs | Tab: Safe Cash |
| training-score-card.ejs | Tab: Progress |
| employee-training.ejs | MERGE |
| video-scripts.ejs | Admin section |

## MERGE: Employee/HR Pages (7 pages → 2)
| Current Pages | Merge Into |
|--------------|------------|
| employees.ejs | **employees.ejs** (main) |
| employee-profile.ejs | Modal/drawer |
| employee-documents.ejs | Tab in profile |
| employee-info.ejs | Tab in profile |
| employee-i9-view.ejs | Tab in profile |
| i9-edit.ejs | Modal |
| id-upload.ejs | Modal |

## MERGE: PTO Pages (3 pages → 1)
| Current Pages | Merge Into |
|--------------|------------|
| pto-admin.ejs | **pto.ejs** (hub) |
| pto-report.ejs | Tab: Reports |
| pto-settings.ejs | Tab: Settings |

## EVALUATE: May Not Be Used (4 pages)
| Page | Question | Recommendation |
|------|----------|----------------|
| **addons.ejs** | What is this for? | CHECK USAGE |
| **processes.ejs** | Process documentation? | CHECK USAGE |
| **ad-spend.ejs** | Ad tracking | KEEP if tied to ROI |
| **ad-budget.ejs** | Budget planning | MERGE with ad-spend |

---

# SECTION 3: ADD (New Features Marcus Would Want)

## Priority 1: Money Makers
| Feature | Why Marcus Wants It | Impact |
|---------|---------------------|--------|
| **15-min Inspection Timer** | "How long has that car been sitting without updates?" | SPEED - Get cars diagnosed faster |
| **GP Pacing Widget** | Show GP pacing on EVERY page header | AWARENESS - Always know the score |
| **Declined Work Alerts** | Push notification when declined work hits 7 days | RECOVERY - Don't let money walk |
| **Same-Day Callback Alert** | Customer declined AM, remind PM | RECOVERY - Strike while iron hot |

## Priority 2: Efficiency Boosters
| Feature | Why Marcus Wants It | Impact |
|---------|---------------------|--------|
| **Tech Efficiency Dashboard** | Side-by-side tech comparison | ACCOUNTABILITY - Who's producing? |
| **Parts ETA Tracker** | When are parts arriving? | SPEED - Plan the day |
| **Bay Turnover Metrics** | How fast are bays cycling? | SPEED - Optimize flow |
| **Customer Wait Time Display** | How long has customer been waiting? | SERVICE - Don't lose them |

## Priority 3: Quick Wins
| Feature | Why Marcus Wants It | Impact |
|---------|---------------------|--------|
| **One-Click RO Status** | Update status without opening RO | SPEED - Less clicking |
| **Mobile-First Board** | Board usable on phone in shop | ACCESS - Use everywhere |
| **Daily Standup View** | Morning briefing: what's pending, what's due | PLANNING - Start day right |
| **End of Day Summary** | Auto-email: GP, cars out, declined | ACCOUNTABILITY - Daily score |

---

# EXECUTIVE SUMMARY

## Current State
- **73 total pages** (too many)
- **~35 pages** could be cut or merged
- **Multiple redundant settings/training sections**
- **Non-auto features** (meal planner, games) distract from core mission

## Recommended State
- **~25-30 pages** after consolidation
- **1 Settings hub** with tabs (not 9+ separate pages)
- **1 Training hub** with tabs (not 8 separate pages)
- **Remove non-auto features** (meal planner, games)
- **Add GP-focused features** (pacing widget, declined alerts)

## ROI Estimate
| Change | Time Saved | Money Impact |
|--------|------------|--------------|
| Consolidated settings | 30 min/week finding settings | Staff efficiency |
| Consolidated training | 1 hr/week for new hires | Training efficiency |
| 15-min inspection timer | 2-3 cars/day faster | $500-1000/day potential |
| Declined work alerts | 1-2 recoveries/week | $200-800/week |
| GP pacing widget | Always aware | Behavioral change |

---

## BOTTOM LINE

**Cut the fat. Focus on GP. Get cars out faster.**

The dashboard has grown organically and accumulated features that don't serve the core mission. A shop owner doesn't need a meal planner or Space Invaders. They need to know:

1. Where's my money? (Daily GP)
2. What's sitting too long? (The Board + Timers)
3. What money am I leaving on the table? (Declined Work)
4. Who's producing? (Scorecards)

Everything else is a distraction.

---

*Report generated by Skynet*
*Planning only - no changes without Matt's authorization*
