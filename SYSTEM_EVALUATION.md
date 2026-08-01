# System Evaluation & Technical Architecture Specifications
**Project Name:** Ascend Evaluation & Performance Analytics Platform  
**Document Version:** 1.0.0  
**Target Environment:** Web (Laravel + Inertia React) & Mobile (NativePHP for Android)

---

## 1. System Purpose & Core Objectives

The **Ascend Evaluation & Performance Analytics Platform** is a hybrid web and mobile application designed to evaluate, measure, and track user physical performance, exercise consistency, and strength progression over time. 

### Core Purpose
1. **Performance Evaluation:** Provide automated algorithmic evaluation of weekly fitness progression, personal records (PRs), total workload volume, and consistency scores.
2. **Data-Driven Insights:** Transform daily workout logs into actionable visual metrics, empowering users to adjust training volume and intensity safely and effectively.
3. **Cross-Platform Accessibility:** Deliver a seamless evaluation experience across desktop web browsers and native mobile Android devices using a unified codebase architecture.

---

## 2. Architectural Overview

Ascend utilizes a **Monolithic Hybrid Architecture** built on Laravel 13, React 19 (via Inertia.js), and NativePHP Mobile for Android deployment.

```
+-----------------------------------------------------------------------+
|                               FRONTEND                                |
|   React 19 + Inertia.js + Vite + Tailwind CSS v4 + Recharts Data Viz  |
+----------------------------------+------------------------------------+
                                   |
                          Inertia / REST API
                                   |
+----------------------------------v------------------------------------+
|                                BACKEND                                |
|                      Laravel 13 Framework (PHP 8.3)                   |
|  +-----------------------+ +--------------------+ +----------------+  |
|  | Controllers           | | Services Layer     | | Repository     |  |
|  | - AnalyticsController | | - AnalyticsService | | - Analytics    |  |
|  | - WorkoutController   | | - WorkoutService   | | - Workout      |  |
|  | - ExercisesController | | - ExerciseService  | | - Exercise     |  |
|  +-----------------------+ +--------------------+ +----------------+  |
+----------------------------------+------------------------------------+
                                   |
                          Eloquent ORM Queries
                                   |
+----------------------------------v------------------------------------+
|                         DATABASE & STORAGE                            |
|             SQLite / MySQL Database + Embedded App Storage            |
+-----------------------------------------------------------------------+
|                                MOBILE                                 |
|         NativePHP Android Engine (Embedded PHP Runtime in APK)        |
+-----------------------------------------------------------------------+
```

---

## 3. Core System Modules & Features

### 3.1 Authentication & Access Control Module
- **Laravel Fortify Integration:** Handles registration, authentication, login sessions, and password recovery.
- **Two-Factor Authentication (2FA):** Support for 2FA challenge and recovery mechanisms for high-security user profiles.
- **Session & API Token Management:** Uses `laravel/sanctum` for managing personal access tokens for API requests and authenticated web sessions.

### 3.2 Workout & Exercise Management Module
- **Exercise Library:** Configurable repository of exercises including categories, default rest intervals, muscle group targets, and tracking metrics.
- **Workout Templates & Folders:** Allows creation of customizable template folders (e.g., Push/Pull/Legs) with pre-set exercises, targeted sets, and weight parameters.
- **Active Workout Session Logging:** Real-time logging of active workouts, tracking per-set metrics (weight, reps, completion state, rest timer in seconds).

### 3.3 Analytics & Evaluation Engine Module
- **Weekly Volume Evaluation:** Calculates total weight lifted across all completed workout sets per week.
- **Personal Record (PR) Detection:** Algorithmic identification of lifetime maximum weight lifted per exercise.
- **Consistency Scoring:** Computes a week-by-week performance score based on workout frequency, completion rates, and set volume.
- **Time-Series Data Visualization:** Formats historical progression into visual charts using Recharts for trend analysis.

### 3.4 Mobile Native Integration Module (NativePHP for Android)
- **Embedded PHP Engine:** Packages PHP 8.3 and the Laravel application inside an Android APK package (`nativephp/android`).
- **Offline Data Storage:** Direct access to local SQLite databases on device storage.
- **Native Android Wrappers:** Gradle configuration (`build.gradle.kts`) and Kotlin wrappers (`ExampleInstrumentedTest.kt`, app resources) managing system lifecycle and Android runtime execution.

---

## 4. Evaluation Methodology & Algorithms

The system's primary evaluation logic resides in [`App\Services\AnalyticsService`](file:///c:/Users/Jeffrey/Herd/ascend/app/Services/AnalyticsService.php), implementing optimized computational routines:

### 4.1 Chronological Personal Record (PR) Detection Algorithm
- **Time Complexity:** $O(N)$ single-pass evaluation where $N$ is the total number of historical sets.
- **Logic:** Maintains an in-memory hash map (`maxWeightMap`) tracking running peak weights per exercise. When iterating chronologically over completed workout sets:
  $$\text{if } w > \text{maxWeightMap}[e], \text{ then update record and increment PR count for current week.}$$

### 4.2 Weekly Performance Scoring Algorithm
The evaluation engine computes a weekly performance score based on three primary weighted metrics:
1. **Workout Count Factor ($F_c$):** Number of completed sessions in the calendar week.
2. **Set Volume Factor ($F_v$):** Total count of completed sets.
3. **Overall Load Volume ($F_l$):** Cumulative weight lifted across all exercises:
   $$\text{Total Load} = \sum (\text{weight} \times \text{reps})$$

The raw score is normalized into a week-over-week comparison rating allowing users to evaluate training intensity progression against prior weeks.

---

## 5. System Security Architecture

### 5.1 Web & Application Security
- **Cross-Site Request Forgery (CSRF) Protection:** Tokenized verification on all non-GET HTTP endpoints.
- **SQL Injection Prevention:** Enforced via Laravel Eloquent ORM parameterized PDO bindings.
- **Cross-Site Scripting (XSS) Prevention:** Inertia.js auto-escaping React frontend props and component state.
- **Sensitive Credential Isolation:** Strict separation of environment credentials (`.env`) with `.gitignore` rules preventing leakages.

### 5.2 Mobile Security & Key Management
- **App Signing Key:** Signed Android releases using Java KeyStore (`ascend.jks`).
- **Isolated App Sandbox:** Application database (`database.sqlite`) stored strictly within the private Android app sandbox, preventing unauthenticated read access from external apps.

---

## 6. Infrastructure & Deployment Tech Stack

| Domain | Technology / Specification |
| :--- | :--- |
| **Backend Framework** | Laravel 13.x (PHP 8.3+) |
| **Frontend Framework** | React 19, Inertia.js 3.0, TypeScript 5.7 |
| **Styling & Components** | Tailwind CSS v4, Radix UI Primitives, Lucide React Icons |
| **Build & Asset Bundling** | Vite 8.x + Laravel Vite Plugin |
| **Mobile Runtime** | NativePHP Mobile for Android (`nativephp/android`) |
| **Database** | SQLite (`database.sqlite`) / MySQL |
| **Process Management** | `concurrently` managing PHP Artisan, Queue Listener, Vite Server |
| **Testing & Quality Assurance**| Pest PHP 4.x, Laravel Pint, ESLint 9, Prettier |

---

## 7. Operational Verification & Code Quality Protocols

To ensure system reliability, performance stability, and security compliance, the platform includes a automated continuous integration suite (`composer ci:check`):

1. **Code Formatting:** `pint --parallel` (Laravel Pint for PHP adherence).
2. **Frontend Quality:** `prettier --check` and `eslint .` for JavaScript/TypeScript standard compliance.
3. **Type Safety:** `tsc --noEmit` verifying TypeScript static types.
4. **Automated Unit & Feature Tests:** `php artisan test` powered by Pest PHP for testing repositories, services, and route endpoints.

---
*Document prepared for Ascend System Evaluation and Technical Architecture Overview.*
