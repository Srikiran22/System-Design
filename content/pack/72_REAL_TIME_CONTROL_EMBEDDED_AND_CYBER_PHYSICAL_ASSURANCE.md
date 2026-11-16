# 72 — Real-time control, embedded systems and cyber-physical assurance

## CPS couples computation to physical dynamics

A cyber-physical system combines computing and communication with physical processes through sensors and actuators. Its behavior depends on software logic, physical dynamics, timing, sampling, network delays, control stability, energy, human interaction and environment. Rajeev Alur's _Principles of Cyber-Physical Systems_ brings together model-based design, concurrency, distributed algorithms, formal methods, control theory, real-time systems and hybrid systems [S170].

## Control-system foundation

Model the plant, sensors, actuators, controller, reference signal, disturbances, feedback path and operating modes. Relevant concepts include transfer functions, state-space models, controllability, observability, stability margins, feedback, feedforward, PID, state feedback, observers, robust/adaptive control and model predictive control. The correct method depends on the plant model, constraints, disturbances, timing and assurance need.

## Timing is a functional property

For networked/embedded control, the timing path may include sensing, sampling, communication, scheduling, computation, actuation and physical response. A system can produce numerically correct output too late to be safe. Specify:

- sample and update periods;
- worst-case execution time and scheduling assumptions;
- end-to-end deadline and jitter;
- sensor/actuator delay and uncertainty;
- packet loss, retransmission and synchronization behavior;
- safe behavior after stale/missing/out-of-order signals.

The networked control research by Hespanha and co-authors links control analysis, sampling/delay, mapping of control loops onto computing/communication resources and scheduling analysis [S220].

## Hybrid systems

Hybrid systems combine discrete transitions (modes, state machines, software) with continuous dynamics (temperature, pressure, velocity, voltage). Analyze guard conditions, reset maps, reachable states, mode transitions, chattering, hysteresis and timing. Mode transitions are frequent sources of unexpected behavior.

## SIL/HIL and verification

Software-in-the-loop and hardware-in-the-loop testing allow portions of the system to be tested against simulated or real interfaces before full deployment. They do not replace physical environmental qualification or operational validation. Preserve test model fidelity, real-time constraints, sensor/actuator emulation, synchronization, fault injection and configuration evidence.

## Degraded-mode and fault management

Define detection, isolation, containment, safe-state transition, reconfiguration, redundancy management, operator notification and recovery. A safe state may not mean “power off”; the safe response depends on physics and mission. Redundant channels require analysis of common power, clocks, communications, software, sensors, environment, maintenance and update paths.

## Assurance questions

- Are requirements stated in terms of physical effect and timing, not only code output?
- Is the plant model valid over the tested envelope?
- Are sensor biases, actuator saturation, drift and calibration represented?
- Can control remain stable with delay, loss, jitter and degradation?
- Are timing assumptions verified on target hardware?
- Is the fail-safe/fail-operational strategy explicit?
- Are unsafe control actions and mode transitions analyzed?
- Are safety, cybersecurity and control engineering integrated rather than siloed?
