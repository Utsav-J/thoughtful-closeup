# A reproducible method for translating product and system design into engineering effort and delivery time

## Executive conclusion

The main finding from the research is that there is **no credible universal deterministic equation of the form “Jira stories × developers = delivery date.”** Established software-estimation methods instead separate three things that are often accidentally mixed together:

**software size → engineering effort → elapsed schedule.**

That separation is the important architectural change I would make to your estimator.

A requirements or design artefact gives you information about **how much software behaviour is changing and how difficult the environment is**. A locally calibrated productivity model converts that into **person-hours**. Team capacity, dependencies, bottlenecks and historical delivery variation then convert those person-hours into **elapsed working days and sprints**. COCOMO II follows essentially this size → effort → schedule structure, while COSMIC explicitly recommends deriving effort from functional size using productivity data from similar completed projects. citeturn17view1turn17view5

For your platform, my recommendation is therefore:

> **Use the LLM to transform the Product Spec + System Design + Compliance specification into a deterministic, reviewable feature vector. Measure functional scope with COSMIC-style functional sizing. Fit a COCOMO-shaped effort equation on your own historical features. Convert effort to schedule using actual team capacity and a probabilistic simulation of historical variation.**

The core equations would be:

\[
\boxed{
S_{\text{CFP}}
=
\sum_i
(E_i + X_i + R_i + W_i)
}
\]

\[
\boxed{
\hat H
=
e^\alpha
S_{\text{CFP}}^\beta
e^{\sum_k \gamma_k x_k}
}
\]

and then:

\[
\boxed{
\text{Person-days}=\frac{\hat H}{8}
}
\]

\[
\boxed{
\text{CapacityHours}_{s}
=
\sum_{d=1}^{N_{\text{dev}}}
8
\times
W_s
\times
A_d
\times
V_{d,s}
\times
F_d
}
\]

where \(W_s\) is the number of working days in the sprint, \(A_d\) is that developer's allocation to the feature, \(V_{d,s}\) captures availability such as leave, and \(F_d\) is an **empirically calibrated effective-capacity factor**, rather than an arbitrary “70% productivity” constant.

The deterministic capacity lower bound is then:

\[
\boxed{
\text{SprintLowerBound}
=
\left\lceil
\frac{\hat H}
{\text{CapacityHours}_{s}}
\right\rceil
}
\]

but that should **not** be the final commitment date. Dependencies and uncertainty mean elapsed schedule is not simply total effort divided by headcount. COCOMO II explicitly models effort and schedule separately, and its schedule equation is non-linear rather than simply `person-months / people`. citeturn17view0turn18view2

Your externally visible result should therefore look more like:

| Output | Recommended representation |
|---|---:|
| Functional size | 120 CFP |
| Normalised Jira stories | 24 |
| Team-local story points | 96 SP |
| Engineering effort | P50: 1,210 h; P85: 1,480 h |
| Engineering person-days | P50: 151.3; P85: 185.0 |
| Delivery sprints | P50: 4; P85: 5 |
| Elapsed working days | P50: 40; P85: 50 for a 10-working-day sprint |
| Confidence | Based on back-tested historical error distribution |
| Estimator version | model-v17 / data snapshot / extraction schema / assumptions |

The distinction between **person-days** and **elapsed working days** is important. A feature that takes 160 person-days does not take 160 elapsed days if several engineers work concurrently; conversely, 160 person-days divided by eight engineers does not necessarily imply 20 elapsed working days because work is not infinitely parallelisable.

The strongest answer to the “more deterministic” requirement is therefore **not to pretend uncertainty disappears**. Make the *estimation procedure deterministic and reproducible*, while making the *delivery forecast probabilistic*. Monte Carlo estimation research makes the same distinction: uncertainty in inputs should propagate into a distribution of project outcomes rather than being hidden behind one number. citeturn16view1turn18view1

## What the established estimation methods actually measure

There are several families of estimation techniques, but they solve different parts of your problem.

| Method | What it measures | Best use in your platform | Main limitation |
|---|---|---|---|
| Story points + velocity | Team-relative estimated backlog size | Compatibility with current Jira process | Not an objective software-size unit |
| Throughput / cycle time | Observed work-item flow | Delivery forecasting | Depends on reasonably comparable work-item definitions |
| COSMIC Function Points | Functional software size | Requirements → objective size | Does not itself account for all NFRs/complexity |
| COCOMO-style model | Size + cost drivers → effort | Size → person-hours | Needs local calibration |
| Monte Carlo / bootstrap | Distribution of possible outcomes | Effort → delivery confidence | Requires historical observations |
| LLM direct estimation | Learned judgement | Extraction/normalisation only | Harder to audit and reproduce as the numeric estimator |

### Story points should not be your primary unit

The Scrum Guide deliberately does not prescribe story points. It says Product Backlog items have a **size**, and that the Developers doing the work are responsible for sizing them; it does not define Fibonacci points, hours or velocity as required units. It also says Sprint forecasting improves when Developers know their **past performance, upcoming capacity and Definition of Done**. citeturn20view1turn20view2

That matters because a “5-point story” has no universal engineering meaning. Five points for Team A cannot safely be treated as equivalent to five points for Team B, nor should there be a global equation such as:

\[
1\text{ SP}=6\text{ hours}
\]

If such a conversion happens to work inside a particular stable team, that relationship should be **learned empirically from that team's history**, not asserted globally.

There is empirical support for being cautious here. A 2022 study covering 37,440 user stories from 37 open-source projects found a strong relationship between human-assigned story points and development time in only 7% of the projects studied; 58% showed a medium relationship and 35% a low relationship. The authors also found substantial inconsistency in human point estimates. The dataset is open-source rather than enterprise delivery, so it should not be generalised blindly, but it is strong evidence against treating story points as an absolute unit of effort. citeturn17view6

I would therefore keep story points because they are useful organisationally, but treat them as an **output compatibility layer**, not the fundamental unit in the estimator.

### Flow metrics are better direct observations of delivery

The current Kanban Guide defines throughput as the exact count of completed work items per unit time and cycle time as the elapsed time from work starting to finishing. These are directly observed delivery quantities rather than subjective estimates. citeturn20view3

That makes historical throughput and cycle-time distributions valuable for your final schedule simulation. The important improvement, however, is to avoid assuming every story is equivalent. Instead of only measuring:

\[
\text{stories completed per sprint}
\]

you can retrospectively measure:

\[
\text{CFP completed per sprint}
\]

or:

\[
\frac{\text{CFP completed}}{\text{available engineering hours}}
\]

giving you a throughput measure whose underlying units are considerably more stable.

### COSMIC gives you the missing objective size variable

COSMIC functional sizing is particularly relevant to your input artefacts because its mapping starts from available functional-requirement artefacts and represents software functionality as functional processes containing four kinds of data movement:

- **Entry:** data enters the software from a functional user.
- **Exit:** data leaves it.
- **Read:** data is retrieved from persistent storage.
- **Write:** data is persisted.

Each such movement counts as one COSMIC Function Point, or CFP. citeturn17view3turn17view4

Thus:

\[
S_{\text{functional-process}}
=
N_E+N_X+N_R+N_W
\]

and:

\[
S_{\text{feature}}
=
\sum_{\text{functional processes}}
S_{\text{functional-process}}
\]

For an enhancement rather than completely new functionality, COSMIC defines the change size as the sum of **added + changed + deleted data movements**. citeturn17view3turn18view3

This is much closer to the variable your existing system is missing. Instead of asking an LLM:

> “How hard does this Jira story feel?”

you ask it structured questions such as:

> “Which functional processes are introduced or modified? Which externally meaningful data groups enter, exit, get read or get written?”

That produces something countable.

COSMIC has also published specific guidance for mapping user-story artefacts into this model, including defining functional users, software boundaries and architectural layers. citeturn17view4

### COCOMO provides the right shape of the effort equation

COCOMO II's general effort structure is essentially:

\[
PM
=
A
\times
Size^E
\times
\prod_i EM_i
\]

where size establishes a baseline and a collection of effort multipliers changes the result according to characteristics such as complexity, reliability, personnel capability, tooling and schedule constraints. The original COCOMO II constants were calibrated from historical projects, and the model documentation explicitly recommends calibration to the organisation's own development environment to improve accuracy. citeturn17view1turn17view2

I would **not use the published COCOMO constants directly for modern feature-level Jira estimation**. Your software, development lifecycle and size unit are different. Use the *functional form* and the principle of local calibration.

That leads naturally to:

\[
\ln H
=
\alpha
+
\beta\ln S
+
\sum_k\gamma_k x_k
+
\epsilon
\]

or equivalently:

\[
H
=
e^\alpha
S^\beta
\prod_k e^{\gamma_k x_k}
e^\epsilon
\]

This is effectively a locally calibrated COCOMO-style model in which **you learn the coefficients from your organisation's completed work**.

COSMIC's own estimation training material describes the same general process: create a historical project database, select similar projects and relevant independent variables, construct a productivity model, and then apply the resulting model to a new functional-size measurement. It gives linear regression as one possible implementation, but warns against presenting only a single point result. citeturn20view5turn20view6

## Mapping your product, system design and compliance artefacts into measurable variables

This is where I think your platform has an unusual advantage. You already generate richer planning artefacts than most estimation datasets have available.

The Product Spec, System Design Document and Compliance overview should be transformed into **two different kinds of variables**:

1. **size variables** — how much observable software functionality is being added or changed;
2. **effort modifiers / constraints** — factors that make an equally sized feature easier or harder to deliver.

COSMIC explicitly distinguishes these. Functional User Requirements determine functional size; non-functional requirements and project constraints may affect project effort without necessarily changing functional size. citeturn16view2turn16view3

That distinction prevents a major modelling problem: **double-counting complexity**.

A sensible extraction schema is:

| Artefact evidence | Derived estimation input | Treatment |
|---|---|---|
| User actions / acceptance criteria | Functional processes | CFP |
| API request/response behaviour | Entries / Exits | CFP when part of FUR |
| Persistent data retrieval | Reads | CFP |
| Persistent state changes | Writes | CFP |
| Added/changed/deleted functionality | Enhancement size | CFP |
| New external integration | Integration driver | Multiplier / categorical variable |
| Existing service modification | Affected-component variable | Modifier |
| New service/component | Architecture novelty variable | Modifier |
| Schema/data migration | Migration workload | Explicit work package + modifier |
| Performance/SLO requirement | Performance driver | Modifier |
| Availability/reliability requirement | Reliability driver | Modifier |
| Security/privacy requirement | Security driver | Modifier unless it introduces functionality |
| Audit/consent/export workflows | Functional behaviour | CFP |
| Regulatory evidence/documentation | Non-code work | Explicit hours/work package |
| Team unfamiliarity with technology | Novelty/familiarity | Modifier |
| Cross-team dependency | Dependency graph | Schedule constraint |
| Reuse of existing implementation | Reuse factor | Modifier |
| UX discovery/research | UX work package | Explicit effort |
| Test-matrix expansion | Verification driver | Modifier/work package |

A compliance requirement makes the distinction especially clear.

Suppose the specification says:

> “All personal data must be encrypted at rest.”

That is primarily a **quality/security requirement**. It generally should not be represented by adding arbitrary CFP merely because it is important. Instead, it influences the effort model through security/technology variables.

But suppose it says:

> “Administrators must be able to review an immutable audit history of every permissions change.”

That creates actual software behaviour: records may need to be written, queried and returned to a user. Those functional processes contribute to functional size. The additional retention, tamper-resistance or certification constraints can separately affect effort. This treatment follows COSMIC's separation of functional requirements, non-functional requirements and project constraints. citeturn16view3turn17view5

The same reasoning applies to your system design. **“Seven services affected” should not itself equal seven points.** The affected-component count is a predictor of integration and coordination cost. The user-observable functional behaviour is the size. The architecture tells you how expensive that functional size is in this particular implementation.

I would have the LLM produce an intermediate record conceptually like this:

```text
Functional size:
  total_cfp
  added_cfp
  changed_cfp
  deleted_cfp

Architecture:
  affected_components
  new_components
  external_integrations
  database_migrations
  async_workflows
  cross_team_dependencies
  technology_novelty
  reuse_fraction

Quality/compliance:
  reliability_class
  performance_class
  security_class
  privacy_class
  compliance_evidence_work
  migration_risk

Delivery:
  normalized_stories
  dependency_graph
  role_requirements
```

The important property is that every generated field should retain **provenance back to a sentence, acceptance criterion or system-design element**. An engineer reviewing an estimate should be able to inspect why `external_integrations = 3`, rather than trusting a hidden LLM judgement.

The LLM therefore becomes a **requirements parser and classifier**, not the thing that decides the answer is “4.7 sprints”.

For reproducibility, persist:

`source documents + extraction schema version + prompt/model version + extracted facts + human overrides + estimator version + calibration-data snapshot + random seed`.

That gets you much closer to the “same conditions produce the same result” property you are looking for.

## The recommended formula and forecasting engine

I would implement the estimator in layers rather than trying to discover one magical formula.

**The first layer is functional size.**

For functional process \(j\):

\[
CFP_j
=
E_j+X_j+R_j+W_j
\]

and:

\[
S
=
\sum_j CFP_j
\]

For an enhancement:

\[
S_{\Delta}
=
CFP_{\text{added}}
+
CFP_{\text{changed}}
+
CFP_{\text{deleted}}
\]

These equations are defined directly by the COSMIC sizing method. citeturn17view3

**The second layer is a historical baseline.**

Before introducing twenty complexity variables, establish a very hard-to-beat simple baseline:

\[
P
=
\operatorname{median}
\left(
\frac{CFP_i}{H_i}
\right)
\]

for sufficiently similar historical features, giving productivity in CFP per engineering hour.

Then:

\[
\hat H_{\text{baseline}}
=
\frac{S_{\text{new}}}{P}
\]

This directly operationalises COSMIC's recommendation to derive effort using functional size and productivity from previous similar projects. COSMIC also stresses that the meaning of “similar” matters because technology, architecture, team skills, system-quality requirements and project constraints all influence effort. citeturn16view2turn17view5

That median-productivity estimator is extremely valuable because it gives you a transparent benchmark. A sophisticated ML estimator that cannot outperform it on unseen historical features should not be shipped.

**The third layer is the parametric effort model.**

Fit:

\[
\boxed{
\ln H_i
=
\alpha
+
\beta\ln CFP_i
+
\gamma_1Integration_i
+
\gamma_2Migration_i
+
\gamma_3Security_i
+
\gamma_4Novelty_i
+
\gamma_5Dependencies_i
+
\dots
+
\epsilon_i
}
\]

and therefore:

\[
\boxed{
\hat H_i
=
\exp(\alpha)
CFP_i^\beta
\exp\left(
\sum_k\gamma_k x_{ik}
\right)
}
\]

This has several desirable properties.

Functional scope remains the central size driver. Architecture, quality and compliance make that scope cheaper or more expensive. The nonlinear exponent \(\beta\) allows your data to tell you whether large features suffer diseconomies of scale. Multiplicative modifiers resemble the architecture of COCOMO II rather than pretending every factor contributes a fixed number of hours. COCOMO II itself incorporates multiple scale and effort factors and recommends local calibration. citeturn17view1turn17view2

Do not add every conceivable variable. Fit a small number of stable, explainable variables first and let out-of-sample evidence justify additional ones. Otherwise you will produce a beautifully precise model of your historical noise.

I would benchmark at least these candidate models:

| Candidate | Equation |
|---|---|
| Historical productivity | \(H=S/P\) |
| Linear functional size | \(H=a+bS\) |
| Power model | \(H=aS^\beta\) |
| Cost-driver model | \(H=aS^\beta e^{\gamma^Tx}\) |
| Analogy | weighted effort of nearest comparable historical features |

COSMIC training material specifically illustrates a linear form `Effort = a × functional size + b`, while COCOMO provides the nonlinear size-with-multipliers form. The correct one for you is whichever consistently performs better on **future-like holdout data**, rather than whichever equation appears more sophisticated. citeturn20view6turn17view1

**The fourth layer is role-specific effort.**

A single total-hours number is sometimes insufficient. For example:

\[
H_{\text{total}}
=
H_{\text{backend}}
+
H_{\text{frontend}}
+
H_{\text{QA}}
+
H_{\text{UX}}
+
H_{\text{security}}
+
H_{\text{platform}}
\]

This becomes important when the system design reveals bottlenecks.

Suppose you have ten developers but only one engineer who can make a particular database migration. Dividing total effort by ten is structurally wrong. The scheduler should respect role/component constraints.

You can either fit separate role models or learn historical proportions conditional on feature characteristics. For example:

\[
H_{\text{backend}}
=
p_{\text{backend}}(x)H_{\text{total}}
\]

The resulting work packages become nodes in a dependency graph.

**The fifth layer is available capacity.**

For developer \(d\) in sprint \(s\):

\[
C_{d,s}
=
8
\times
W_s
\times
A_{d,s}
\times
V_{d,s}
\times
F_d
\]

and:

\[
C_s=\sum_dC_{d,s}
\]

where:

- \(W_s\) = actual working days in that sprint after weekends and holidays;
- \(A_{d,s}\) = allocation to this product/feature;
- \(V_{d,s}\) = availability after leave, on-call duties, etc.;
- \(F_d\) or a team-level equivalent = historically observed effective engineering fraction.

Do **not** hard-code an industry “focus factor” such as 0.7. Derive it from your own completed work.

The simplest capacity lower bound is:

\[
LB_{\text{capacity}}
=
\left\lceil \frac{H}{C_s}\right\rceil
\]

If the critical path through the system-design dependency DAG takes \(CP\) working days:

\[
LB_{\text{dependencies}}
=
\left\lceil
\frac{CP}{W_s}
\right\rceil
\]

then:

\[
\boxed{
LB_{\text{schedule}}
=
\max(
LB_{\text{capacity}},
LB_{\text{dependencies}}
)
}
\]

This is only a lower bound because finite role capacity and resource contention can make the actual resource-constrained schedule longer.

COCOMO's own architecture is useful evidence here: it distinguishes development effort from calendar development time and defines a separate schedule equation rather than obtaining schedule merely by dividing effort by team size. citeturn17view0turn18view2

**The final layer should be probabilistic.**

For simulation \(r\):

1. Take the calculated functional size and cost drivers.
2. Generate predicted effort.
3. Sample a historical residual from comparable past features.
4. Sample actual capacity/absence variation from comparable sprints.
5. Sample historical blocking/lead-time behaviour where relevant.
6. Allocate work across the dependency DAG and role capacities.
7. Record the sprint and working day in which the last required work item finishes.
8. Repeat thousands of times.

Monte Carlo research in software estimation describes essentially this pattern: construct a parametric model, sample uncertain inputs, evaluate it repeatedly and analyse the resulting distribution and confidence intervals; historical project information can be used to construct the input distributions. citeturn16view1turn18view1

Your API then returns something such as:

\[
P(\text{finished by Sprint }4)=0.58
\]

\[
P(\text{finished by Sprint }5)=0.87
\]

\[
P(\text{finished by Sprint }6)=0.96
\]

I would use:

**P50** as the internal “most useful planning” forecast and **P85** as the externally safer commitment forecast. That particular choice of percentiles is a product/risk policy, not a Scrum or software-estimation standard; a risk-sensitive organisation can choose P90 or P95 instead.

This is a substantially better meaning of “confidence” than an LLM returning “confidence: high”.

## Converting the estimate into stories, story points, days and sprints

Your desired outputs are all possible, but they should be derived differently.

### Stories

Since your Product Spec already contains generated Jira stories, the best calculation is simply:

\[
\boxed{
N_{\text{stories}}
=
\text{count of normalised deliverable stories}
}
\]

The key word is **normalised**.

Use one versioned story-splitting policy. Among other things, each candidate backlog item should be small enough that it could be completed inside one Sprint; the Scrum Guide likewise describes items that can be Done within one Sprint as ready for Sprint Planning and describes refinement as breaking items into smaller, more precise items. citeturn20view2

Where you need to estimate story count before complete decomposition, use your local history:

\[
\widehat{N}_{stories}
=
\left\lceil
\frac{CFP_{\text{feature}}}
{\operatorname{median}(CFP/\text{story})_{\text{similar}}}
\right\rceil
\]

but I would show that as an estimated count, not pretend stories are a natural physical unit. Changing your story-writing policy will change the number without changing the actual product.

### Story points

For points, there should be **no universal formula from hours**.

If developers have already estimated the stories, preserve those estimates:

\[
SP_{\text{total}}
=
\sum_i SP_i
\]

If the platform must generate story points automatically, train a **team-specific mapper**:

\[
SP_i
=
g(
CFP_i,
components_i,
integrations_i,
novelty_i,
NFR_i,
dependencies_i
)
\]

and then map its continuous prediction to your team's accepted scale, for example 1/2/3/5/8/13.

The important point is:

\[
\boxed{
\text{CFP is the cross-feature sizing unit; SP is the team-local presentation unit.}
}
\]

Do not force a global `CFP → SP` ratio either. Learn it independently for each stable team or workstream.

The evidence against assuming points are intrinsically proportional to development time is significant enough that points should be a secondary output. citeturn17view6

### Effort hours and person-days

This conversion is unambiguous given your eight-hour requirement:

\[
\boxed{
\text{PersonDays}
=
\frac{\text{EngineeringHours}}{8}
}
\]

So:

- 800 engineering hours = 100 person-days;
- 1,200 engineering hours = 150 person-days;
- 1,600 engineering hours = 200 person-days.

If you happen to compare your output with COCOMO's published person-month units, note that the COCOMO II documentation defines its traditional person-month as 152 working hours, or 19 eight-hour person-days. You do not need to adopt that convention; keeping your internal estimator directly in hours is cleaner. citeturn17view2

### Elapsed working days

This is not the same as person-days.

For a simulation that takes \(S\) complete sprints plus \(D\) days of a partial sprint:

\[
\boxed{
ElapsedWorkingDays
=
S \times W_s+D
}
\]

where \(W_s\) is the actual number of working days in your sprint.

For a two-week sprint with ten working days, five sprints means approximately 50 elapsed working days, subject to your holiday calendar.

### Sprints

There are three useful sprint estimates.

**Capacity-only estimate**

\[
S_{\text{capacity}}
=
\left\lceil
\frac{H}{C_{\text{sprint}}}
\right\rceil
\]

**Flow estimate**

Once you backfill CFP for historical completed work, compute:

\[
Q_j
=
CFP\text{ completed in sprint }j
\]

or preferably capacity-normalised:

\[
Q_j^{*}
=
\frac{CFP_j}
{C_j}
\]

Then bootstrap historical \(Q_j^*\) observations under the new sprint's capacity until the required CFP has been completed.

The Kanban Guide's throughput definition provides the underlying flow concept; the modification here is to use a stable functional-size quantity rather than treating every story as equally sized. citeturn20view3

**Final simulation estimate**

Use the effort model + historical residuals + actual capacity + dependency structure.

That gives:

\[
Sprint_{P50},\quad Sprint_{P85},\quad Sprint_{P95}
\]

This is the number I would ultimately expose as the official forecasting result.

Your present velocity calculation:

\[
\frac{SP_{\text{feature}}}{SP_{\text{per sprint}}}
\]

should remain in the system as a **baseline estimator**. Do not remove it initially. Make the new model prove that it beats it.

## Worked example

Consider a completely illustrative feature. These coefficients are deliberately fictional; they are **not industry benchmarks** and should never be copied into production.

Suppose the Product Spec and System Design produce:

| Extracted variable | Value |
|---|---:|
| COSMIC functional size | 120 CFP |
| Normalised stories | 24 |
| External integrations | 2 |
| Affected components | 5 |
| Data migration | Yes |
| Elevated security/compliance | Yes |
| Cross-team dependency | 1 |
| Story points from team-specific mapper | 96 SP |

Assume your historical data has fitted this simplified model:

\[
H_{\text{base}}
=
50+8.0S
\]

and the relevant combined local multiplier from migration/security/integration is 1.20.

Then:

\[
H
=
(50+8\times120)\times1.20
\]

\[
H
=
(50+960)\times1.20
\]

\[
\boxed{
H=1,212\text{ hours}
}
\]

At eight hours per working day:

\[
\frac{1212}{8}=151.5
\]

so:

\[
\boxed{
151.5\text{ engineering person-days}
}
\]

Now suppose your eight-developer team's measured **effective capacity for work of this class** is historically about 360 engineering hours per sprint after leave, meetings, BAU work, on-call load and other allocations.

The pure capacity result is:

\[
\frac{1212}{360}=3.37
\]

so the deterministic lower-bound result is:

\[
\boxed{4\text{ sprints}}
\]

For a ten-working-day sprint:

\[
\boxed{40\text{ elapsed working days}}
\]

is the capacity-only answer.

But assume historical estimation residuals, sprint-capacity variation and blocking are then simulated, and the resulting empirical distribution happens to be:

| Completion | Probability reached |
|---|---:|
| 3 sprints | 18% |
| 4 sprints | 61% |
| 5 sprints | 87% |
| 6 sprints | 96% |

Your final result becomes:

```text
Stories
24

Story points
96 SP
Team-specific; not used as the primary effort unit

Functional size
120 CFP

Engineering effort
P50: 1,212 hours
P85: 1,480 hours

Engineering person-days
P50: 151.5 days
P85: 185.0 days
8 hours/person-day

Delivery duration
P50: 4 sprints / 40 working days
P85: 5 sprints / 50 working days

Team
8 developers

Estimator
effort-model-v17
functional-sizing-schema-v4
capacity-model-v6
calibration-snapshot-2026-10-01
```

That output is far more informative than saying:

> “The team normally does 25 points per Sprint and this is 96 points, therefore 3.84 Sprints.”

The latter calculation can still appear as:

```text
Velocity baseline: 3.84 sprints
Model forecast P50: 4 sprints
Model forecast P85: 5 sprints
```

That comparison is valuable because it lets you measure whether the new estimator genuinely adds predictive value.

Also note what happens if the developer count goes from eight to sixteen. You **should not simply halve 4 sprints to 2**. The capacity changes, but the dependency graph, serial work, specialist bottlenecks, onboarding/coordination and architectural critical path do not automatically halve. COCOMO's separation of effort and schedule exists for exactly this general reason: calendar duration is a distinct quantity from aggregate labour effort. citeturn17view0turn18view2

## Calibration, validation and implementation

The quality of this entire system will ultimately be determined less by which formula you choose and more by the quality of the historical observations used to calibrate it.

COSMIC's estimation guidance is explicit that productivity and estimation models should be built from historical projects selected for relevant similarity, including attributes such as functional size, development type, domain, technology/platform and measurement quality. citeturn20view5

For each completed feature, I would create a permanent estimation record containing:

| Category | Historical fields to preserve |
|---|---|
| Initial scope | Original Product Spec and requirements snapshot |
| Functional size | CFP at planning time |
| Final scope | Final CFP after approved scope changes |
| Architecture | Components, integrations, migration, novelty |
| NFR/compliance | Security, reliability, performance, regulatory factors |
| Backlog | Story count and story points at estimation time |
| Effort | Actual engineering hours, ideally by role |
| Capacity | Developer count, allocation, leave, holidays |
| Flow | Start/finish timestamps and cycle times |
| Schedule | Sprint started, sprint completed |
| Dependencies | Cross-team and external blocking |
| Rework | Defects, rejected work, redesign |
| Prediction | What the model predicted at the time |
| Model metadata | Model/version/data snapshot |

A particularly important rule is:

> **Never train the estimator using information that was not available at the moment when the estimate would have been made.**

For example, final story count after three sprints of refinement cannot be an input to an “initial planning” estimator. Otherwise you create target leakage and apparently excellent historical accuracy that disappears in production.

Scope change should also be separated from estimation error:

\[
\text{Initial forecast error}
\neq
\text{scope added after forecast}
\]

Preserve both:

\[
CFP_{\text{baseline}}
\]

and:

\[
CFP_{\text{final}}
\]

so you can distinguish:

> “We estimated the original scope badly”

from:

> “The feature grew by 35% after estimation.”

This will substantially improve the feedback your model receives.

For validation, use chronological or rolling holdouts: train only on work that would historically have been available before the feature being predicted.

Every model should be compared with at least:

\[
Baseline_A=\text{current story-point velocity method}
\]

\[
Baseline_B=\text{median effort/CFP}
\]

\[
Baseline_C=\text{median effort of similar historical features}
\]

and the sophisticated estimator is accepted only if it reliably outperforms them.

Do not use \(R^2\) alone as the success metric. In particular, estimation research has criticised common relative-error metrics such as MMRE for statistical bias and has argued that prediction systems should be evaluated against meaningful baseline predictors rather than merely reporting a seemingly impressive fit statistic. citeturn16view0turn18view0

For your business problem, the most intelligible scorecard would be:

| Metric | Why it matters |
|---|---|
| MAE in engineering hours | Average absolute effort miss |
| Median absolute error | Resistant to a few catastrophic features |
| Signed error | Detects systematic optimism/pessimism |
| MAE in sprints | Directly understandable by planning teams |
| P50 coverage | Tests calibration of median forecast |
| P85 coverage | Tests whether “85% confidence” really behaves like 85% |
| Current velocity MAE | Existing-system baseline |
| Median-CFP model MAE | Simple parametric baseline |

The P85 calibration test is particularly important. Across a large enough rolling history, if an estimate labelled “P85” is completed inside that forecast only 60% of the time, your model is not an 85% forecast, regardless of how persuasive the model explanation sounds.

The model should also be segmented where the evidence says productivity regimes differ. A React frontend team, a distributed-systems backend team and an infrastructure/security team need not share the same relationship between functional size and effort. COSMIC estimation guidance itself recommends selecting comparable historical projects rather than blindly pooling unrelated environments. citeturn20view5turn17view5

A practical production architecture is therefore:

```text
Product Spec
System Design
Compliance Spec
        |
        v
LLM structured extraction
        |
        v
Canonical Estimation IR
        |
        +--> Functional-process / CFP calculator
        |
        +--> Architecture + NFR cost-driver extractor
        |
        +--> Story normaliser / dependency DAG
        |
        v
Locally calibrated effort model
        |
        v
Effort distribution in engineering hours
        |
        +--> / 8 => person-days
        |
        v
Role + sprint capacity model
        |
        v
Dependency-aware Monte Carlo scheduler
        |
        v
P50 / P85 / P95 sprints and working days
        |
        +--> team-local story-point projection
        |
        +--> current velocity baseline
```

The central architectural principle is that the **LLM does not own the mathematics**. It supplies structured evidence to an estimator whose equations, coefficients, training data and output can be audited and versioned.

The Scrum Guide itself frames forecasting in complex work as empirical and specifically notes the importance of past observed information and upcoming capacity. citeturn20view0turn20view1 The Kanban Guide gives you observable throughput and cycle-time variables. citeturn20view3 COSMIC gives you a repeatable functional-size measure and a principled separation between functional scope and non-functional/project effort drivers. citeturn17view3turn16view3 COCOMO gives you the established parametric pattern of size, scale factors and effort multipliers, together with the principle of local calibration and separate schedule estimation. citeturn17view1turn17view2 Probabilistic software-estimation research gives you the final step: propagate the historical uncertainty instead of masking it behind a single deterministic date. citeturn16view1

Taken together, the estimator I would build for your exact use case is:

\[
\boxed{
\begin{aligned}
\text{Documents}
&\rightarrow
(CFP,x,DAG,Stories)\\[3pt]
H
&=
e^\alpha CFP^\beta e^{\gamma^Tx}\\[3pt]
PersonDays
&=
H/8\\[3pt]
Capacity_s
&=
\sum_d 8W_sA_dV_{d,s}F_d\\[3pt]
Schedule
&=
MonteCarlo(H,\ Capacity,\ DAG,\ HistoricalResiduals)\\[3pt]
Output
&=
\{
Stories,\ SP,\ Hours,\ PersonDays,\ P50/P85/P95\ Sprints,\ WorkingDays
\}
\end{aligned}
}
\]

That is the closest thing the research supports to a **reproducible, auditable “formula” from product/system design to effort and delivery time**. The deterministic part is the measurement and locally fitted equation; the probabilistic part is the delivery reality.