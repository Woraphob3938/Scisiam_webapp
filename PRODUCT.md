# Product

Status: Active product reference.

## Product Position

SciSiam is a Thai-first virtual science lab for secondary-school students and teachers. It helps learners explore a concept by adjusting variables, observing a simulation, reading graphs and tables, saving an experiment run, and asking AI ไออุ่น for guided help.

The catalog contains 103 registered labs across Physics, Chemistry, Biology, Mathematics, and Foundation. Every registered lab opens a topic-matched simulation; direct and shared simulation engines are implementation details, not a reason to show unrelated content.

SciSiam is ready for a believable competition demo today and is being designed for long-term web, PC, and mobile use. The product must remain reliable in a real classroom before it becomes more elaborate.

## Users

- **Students** discover a lab, learn the theory, run a simulation, save results, review their own learning history, and receive classroom assignments and notifications.
- **Teachers** create or join classrooms, choose labs, publish assignments with files or links, review student submissions, and use the teacher dashboard for real classroom activity.
- **Judges and school stakeholders** should be able to understand the value and complete a credible end-to-end learning flow without mock data being presented as real.

## Core Product Flow

1. A new user registers with a student or teacher role and confirms their email.
2. A returning user signs in without choosing a role; the stored profile role determines the experience.
3. The user finds a lab, reads its objectives, equipment, theory, and steps, then runs the matching simulation.
4. The user saves a run and sees account-owned learning history.
5. In a classroom, teachers create assignments and students receive notifications, submit files or links, and review the result in the appropriate workspace.

## Product Boundaries

- Supabase Auth and database records are canonical for accounts, profiles, experiment runs, classrooms, assignments, and notifications. Browser storage is only a responsive UI/offline convenience and never authorization.
- Active scores, points, levels, XP, and teacher grading are intentionally out of scope. Legacy database columns remain only for compatibility.
- AI ไออุ่น is a guided educational assistant, not an authority. It must identify uncertainty and stay scoped to the current lab when context is available.

## Product Purpose

SciSiam exists to make science experiments more accessible, safer, and easier to understand for Thai learners. It reduces dependence on physical lab equipment by providing interactive virtual labs with subject-specific visuals, real-time controls, formulas, graphs, tables, progress, and AI-assisted explanations.

Success means a student can complete a lab flow independently, understand what variable changed and why, and leave with a clearer mental model of the science. For teachers and judges, success means the product feels reliable, coherent, and ready to extend beyond a prototype.

## Brand Personality

Clean, trustworthy, friendly, and intelligently restrained.

SciSiam should feel like a modern Thai science learning dashboard: calm enough for repeated study, polished enough for a competition demo, and warm enough that students are not afraid to explore. The voice should be clear, encouraging, and specific to science learning rather than generic marketing.

## Anti-references

SciSiam should not feel like a loud game UI with saturated colors everywhere, a generic gradient landing page, or a decorative dashboard packed with cards that do not support learning. It should avoid childish visuals, unclear sci-fi decoration, fake system-status badges, and any layout that makes the user hunt for the next useful action.

It should also avoid misleading readiness: unsupported future labs must not route to the wrong simulation, mock profile or dashboard data must not pretend to be production truth, and AI features must not imply perfect correctness.

## Design Principles

1. Learning first: prioritize the experiment, variables, formulas, graphs, and next action over decoration.
2. Calm density: show enough information for learning, but group it so students can scan without fatigue.
3. Science-specific clarity: each lab needs visuals, equipment, theory, and simulation states that match the actual topic — including mathematics labs where the "apparatus" is a function, graph, or geometric object rather than physical equipment.
4. Trust through correctness: routes, units, formulas, saved data, AI behavior, and readiness labels must be honest and consistent.
5. Progressive ambition: build for the competition demo now while keeping decisions compatible with future web, PC, and mobile deployment.

## Accessibility & Inclusion

SciSiam should target WCAG AA as the baseline. Thai text must be readable on 390px mobile screens, with comfortable line height, no negative letter spacing, and no clipped tone marks or overflowing button labels.

Interactive elements need visible focus states, keyboard-accessible controls, meaningful labels, and touch targets that work on mobile. Color cannot be the only way to communicate subject, readiness, success, warning, or error state. Motion should be subtle, purposeful, and respect reduced-motion preferences.
