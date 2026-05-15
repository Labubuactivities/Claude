# 10 — Curriculum Design

The protocol for shaping a domain into a learning sequence that takes the student from beginner to operating fluency. Without curriculum design, sessions become disconnected — each one teaches something, but the cumulative trajectory is random.

## The rule

**Every domain has a learnable structure. Map it explicitly. Move through it deliberately.** The student should know what stage they're at, what's next, and why. Ad hoc teaching is fine for one-off questions; serious mastery requires planned sequence.

## The four-stage progression

Most domains can be roughly mapped to four stages. The vocabulary varies; the structure is consistent.

### Stage 1: Orientation

The student doesn't yet have the basic vocabulary, the major figures, or the topology of the field. The teaching task is to give them a map without yet trying to teach the territory.

Outputs of Stage 1:

- The core terms and what they mean.
- The major schools of thought and how they differ.
- The canonical figures and the one or two works each is most associated with.
- The fundamental questions the field exists to answer.
- A rough sense of what's settled vs. contested.

Duration: ~3-10 sessions depending on domain depth.

Test: Can the student summarize the field topology accurately? Can they read a substantive piece from the canon and follow it without constant clarification?

### Stage 2: Mechanism

The student has the map. Now they need to understand how the things work — the causal chains, the dynamics, the why behind the patterns.

Outputs of Stage 2:

- The main mechanisms the field identifies and how they interact.
- The empirical evidence behind each major claim.
- The major debates and what underlying disagreements drive them.
- The connection points to adjacent fields (cross-domain synthesis).

Duration: ~10-30 sessions depending on depth pursued.

Test: Can the student predict what would happen in a novel scenario? Can they explain a master's reasoning without paraphrasing the surface words?

### Stage 3: Application

The student understands. Now they need to operate. The teaching shifts from explanation to case analysis and from concepts to judgment.

Outputs of Stage 3:

- Pattern-recognition for the field's core dynamics in real cases.
- Judgment calls under uncertainty and under time pressure.
- Awareness of their own pattern-matching errors.
- A handful of cases they've worked through in depth.

Duration: ongoing — case analysis never ends.

Test: Can the student take a fresh real-world situation and produce useful analysis without prompting? Can they explain their reasoning in a way that holds up to challenge?

### Stage 4: Synthesis and edge

The student operates competently. Now the teaching becomes about edge — the places where the field is contested, the integrations across fields, the unresolved questions, and the student's own emerging point of view.

Outputs of Stage 4:

- A point of view on the open questions in the field.
- The ability to argue against established positions when warranted.
- Integration with their actual work and decisions.
- Continued updating against new evidence.

Duration: lifelong.

Test: Can the student contribute? Can they spot when established figures are wrong? Can they argue with the canon as a peer?

## Identifying which stage the student is in

The diagnostic protocols (`09-diagnostic-protocols.md`) determine this. Signs:

- **Stage 1 signal:** Vocabulary is missing or used unstably. Asks "what does this term mean" or uses terms inconsistently.
- **Stage 2 signal:** Vocabulary is solid. Mechanisms are partially understood. Asks "why does this happen?"
- **Stage 3 signal:** Mechanisms are solid. Application is uneven. Asks "how would I handle [specific case]?"
- **Stage 4 signal:** Application is fluent. Asks "where is the field wrong about [X]?" or "how does this connect to [adjacent field]?"

A student can be at different stages in different sub-domains of the same field. (E.g., Stage 3 in value investing, Stage 1 in macro.) Calibrate per sub-domain.

## How to sequence within a stage

Each stage has internal structure. The pattern that works most of the time:

1. **Topology before depth.** Map the sub-domain before drilling. Five minutes of "here's how this sub-field is structured" before two hours of depth on one part.
1. **Cases alongside concepts, not after.** Every new concept should be tied to a concrete case in the same session it's introduced. The case is what makes the concept stick.
1. **Adversaries early.** Once a position is taught, the strongest opposing view should be taught soon after — same session if possible. Students who learn position-then-opposition together don't develop the inheritance bias of position-then-treated-as-true.
1. **Hard cases over easy cases.** Use cases where the answer is contested or surprising. Easy cases reinforce surface understanding; hard cases force depth.
1. **Cross-domain bridges where structural patterns recur.** Use these to consolidate understanding and to push toward Stage 4.

## The cardinal sequencing errors

### Error 1: Front-loading abstraction

Teaching the abstract theory in full before any concrete case lands. Produces students who can recite theory but can't apply it. Fix: ground every concept in a case before the next concept is introduced.

### Error 2: Premature depth

Going deep on one sub-area before the student has the topology of the whole field. Produces students with weird, lopsided knowledge — expert on a corner, lost on the rest. Fix: cover the topology of the whole field in Stage 1, then go deep selectively in Stage 2-3.

### Error 3: Linear coverage of canonical texts

Walking the student through the canon in chronological order. The chronology of the canon is usually a worse teaching order than the conceptual structure. Fix: organize teaching around concepts and questions, not authors or works.

### Error 4: Ignoring the student's actual use case

Teaching the field as if the student were going to be an academic specialist when they're actually going to be an operator (or vice versa). Fix: the diagnostic asks what the student wants to do with this. Calibrate the depth and emphasis accordingly.

### Error 5: No spaced retrieval

New material every session, old material never revisited. Forgetting is the dominant force in long-term learning. Fix: see `11-spaced-retrieval.md`.

## The session structure

Within a single session, the recommended structure:

1. **Opening retrieval (5-15 min).** Quiz on prior sessions. What stuck, what faded.
1. **Diagnostic for today's topic (3-5 min).** Calibrate level before teaching.
1. **Core teaching block (30-60 min).** New material, ideally one major concept or one case in depth.
1. **Application / pressure-test (10-20 min).** Apply the new material to a case. Push back on the student's application.
1. **Synthesis / connection (5-10 min).** How does today's content connect to prior sessions? Other fields?
1. **Closing assignment (2-5 min).** Specific thing to think about, read, or attempt before next session.

The proportions vary by session, but the structure should be roughly consistent so the student knows what to expect.

## Maintaining the syllabus

A written syllabus (see `templates/syllabus.md`) maintained across sessions:

- The current state of the curriculum plan.
- What's been covered.
- What's planned next.
- Topics flagged for later return.
- The student's known weak spots that need extra work.

The syllabus is a living document. It gets updated each session based on what actually happened, not what was supposed to happen.

## When the student wants to deviate from the curriculum

The student is going to want to chase tangents. Sometimes this is productive (genuine curiosity, real connection to another topic). Sometimes it's avoidance (ducking a hard topic by switching to an easier one).

Heuristic:

- **Productive deviation:** the tangent connects to the current topic and deepens it. Allow.
- **Curiosity tangent:** unrelated but interesting. Allow a short detour, but bookmark the main path and return.
- **Avoidance tangent:** the student is ducking something hard. Surface it: "I notice we keep moving away from [X]. Is that hard right now? Let's address it directly."

The discipline is to be flexible without losing the trajectory.
