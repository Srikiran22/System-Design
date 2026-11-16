# 56 — Control, embedded and cyber-physical systems

## Scope

A cyber-physical system (CPS) couples computation and communication with physical processes through sensors, actuators and feedback. Examples include vehicles, robots, medical devices, industrial plants, aircraft, smart buildings and energy systems. A software-only architecture view is insufficient because time, physical dynamics, uncertainty, energy, sensing, actuation and human intervention are part of the system boundary. [S170]

## System model

Represent the closed loop:

**Physical process → sensors → signal conditioning/estimation → controller/computation → communications → actuators → physical process.**

The actual system also contains operators, environment, power, networks, maintenance, safety interlocks, diagnostics and external disturbances. Model the plant, sensors, actuators, controller, scheduler, communication path and operating modes separately before analyzing the loop as a whole.

## Core control concepts

- **State:** variables needed to describe the system’s dynamic condition. State-space form commonly uses \(\dot{x}=Ax+Bu\), \(y=Cx+Du\) for linear time-invariant continuous systems; discrete-time systems use a corresponding state-update equation.
- **Open-loop vs closed-loop:** open-loop control does not use measured output for correction; closed-loop control compares measured behavior with a reference and adjusts control input.
- **Stability:** whether internal or input-output behavior remains bounded/converges under specified assumptions. Stability is not equivalent to performance or safety.
- **Controllability:** whether inputs can move the state as required under the model. **Observability:** whether internal state can be inferred from available outputs.
- **Robustness:** tolerance to model error, disturbances, parameter variation and uncertainty.
- **Estimator/observer:** reconstructs hidden state from measurements and a model.
- **Sampling and delay:** digital control adds sample/hold, discretization, jitter, computation and communication delay; excessive delay can destabilize a loop.
- **Saturation and actuator limits:** a mathematically valid controller may demand impossible physical input. Windup, rate limits and fail-safe state must be handled.

The equations above are a starting abstraction, not a substitute for model selection, physical validation or nonlinear analysis. A plant may be nonlinear, hybrid, stochastic, time-varying or mode-dependent.

## Controller families and when they appear

| Family                     | Main idea                                                            | Use when                                                 | Watch for                                                                          |
| -------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| PID                        | Proportional, integral and derivative action                         | Many practical single-loop regulation tasks              | Tuning, noise, saturation, coupling and changing plant dynamics                    |
| Feedforward                | Compensate for measured/known disturbance                            | Disturbance is observable and model is useful            | Model error; usually pair with feedback                                            |
| State feedback             | Control based on estimated state                                     | State-space model and state estimation are available     | Model validity, controllability, observer design and actuator limits               |
| Model predictive control   | Optimize a finite-horizon forecast, apply first move and re-optimize | Constraints and multivariable trade-offs matter          | Model accuracy, computational deadline, infeasibility and safe fallback            |
| Adaptive/robust control    | Account for uncertainty or changing dynamics                         | Parameters vary or uncertainty is significant            | Adaptation transients, proof assumptions, unmodeled modes and stability guarantees |
| Supervisory/hybrid control | Switches among discrete modes and continuous controllers             | Startup, shutdown, fault, degraded and maintenance modes | Unsafe transitions, mode explosion and race conditions                             |

## Embedded and real-time engineering

Real-time correctness includes **when** a result is produced, not only what value is computed. Distinguish hard deadlines, firm deadlines and soft deadlines according to the consequence of missing them.

Core topics: interrupt latency; task scheduling; worst-case execution time; priority inversion; periodic/sporadic tasks; rate-monotonic and earliest-deadline-first scheduling; memory bounds; watchdogs; boot and update integrity; clock synchronization; bus arbitration; memory-mapped I/O; power and thermal limits; fault containment; diagnostics; safe boot; secure update; and field servicing.

Design artifacts should include a timing budget, task/resource model, hardware/software interface specification, mode/state model, error handling, update/recovery plan and hardware/software integration test strategy.

## Co-design and verification

Physical hardware and software constraints must be co-designed: processor choice, sensor quality, actuator dynamics, bus bandwidth, power, thermal limits, sampling rate, quantization, latency and environmental qualification interact. A sensor can be logically correct but physically miscalibrated; a command can be computed correctly but arrive too late or saturate an actuator.

Use layered evidence:

1. Analytical models and stability/control analysis.
2. Model-in-the-loop (MIL) simulation.
3. Software-in-the-loop (SIL) and processor-in-the-loop (PIL) tests where relevant.
4. Hardware-in-the-loop (HIL) tests with representative sensors/actuators or plant simulation.
5. Environmental, fault-injection, integration and acceptance tests.
6. Operational monitoring, calibration, maintenance and incident learning.

Test nominal, boundary, transient, degraded, fault and recovery modes—not just a happy-path setpoint response.

## Safety and security coupling

Cyber-physical security is a safety concern when an attacker can manipulate control inputs, sensor observations, firmware, timing, configuration or operator awareness. Separate safety and security analyses, then resolve shared controls and conflicts. Safety interlocks should be independent enough to remain effective under plausible controller/software failures; independence claims require evidence about shared power, clocks, sensors, network, maintenance and configuration.

## When this discipline is essential

Use CPS/controls methods when system behavior depends on physical dynamics, timing, sensor/actuator quality, environmental variation, human operation or safety constraints. A generic REST-service architecture cannot stand in for a control-system architecture.

## Sources

[S117, S131, S135, S170, S179]
