# Editorial Module Workflow Diagram

```mermaid
graph TD
    %% User Roles
    EAM[Editor Assistant - Maker]
    REC[Receptionist]
    EC[Editor - Checker]
    PR[Proof Reader]

    %% Workflow Screens
    EI01[EI-01<br/>Edition Initiation]
    EDC01[EDC-01<br/>Edition Details Capture]
    TEA01[TEA-01<br/>Title Extraction & Addition]
    ELU01[ELU-01<br/>Edition Letter Upload]
    HCRSU01[HCRSU-01<br/>Hard Copy Receipt & Status Update]
    PA01[PA-01<br/>Proofreading Allocation]
    PEC01[PEC-01<br/>Proofreading & Error Capture]
    ECR01[ECR-01<br/>Error Claim & Revision]
    RHM01[RHM-01<br/>Revision History Maintenance]
    CSS01[CSS-01<br/>Content Storage & Sharing]

    %% Workflow Connections - Editor Assistant Maker Path
    EAM --> EI01
    EI01 --> EDC01
    EDC01 --> TEA01
    TEA01 --> ELU01

    %% Receptionist Path
    REC --> HCRSU01

    %% Editor Checker Path
    EC --> PA01

    %% Proof Reader Path
    PR --> PEC01
    PEC01 --> ECR01

    %% Final Editor Checker Path
    EC --> RHM01

    %% Final Editor Assistant Maker Path
    EAM --> CSS01

    %% Cross-workflow dependencies
    ELU01 -.-> HCRSU01
    HCRSU01 -.-> PA01
    PA01 -.-> PEC01
    ECR01 -.-> RHM01
    RHM01 -.-> CSS01

    %% Styling
    classDef roleClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef screenClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class EAM,REC,EC,PR roleClass
    class EI01,EDC01,TEA01,ELU01,HCRSU01,PA01,PEC01,ECR01,RHM01,CSS01 screenClass
```

## Workflow Sequence Diagram

```mermaid
sequenceDiagram
    participant EAM as Editor Assistant
    participant REC as Receptionist
    participant EC as Editor
    participant PR as Proof Reader

    Note over EAM: Edition Creation Phase
    EAM->>EAM: EI-01 Edition Initiation
    EAM->>EAM: EDC-01 Edition Details Capture
    EAM->>EAM: TEA-01 Title Extraction & Addition
    EAM->>EAM: ELU-01 Edition Letter Upload

    Note over REC: Document Receipt Phase
    REC->>REC: HCRSU-01 Hard Copy Receipt & Status Update

    Note over EC: Work Allocation Phase
    EC->>EC: PA-01 Proofreading Allocation

    Note over PR: Quality Control Phase
    PR->>PR: PEC-01 Proofreading & Error Capture
    PR->>PR: ECR-01 Error Claim & Revision

    Note over EC: Review & Approval Phase
    EC->>EC: RHM-01 Revision History Maintenance

    Note over EAM: Content Management Phase
    EAM->>EAM: CSS-01 Content Storage & Sharing
```

## Role Responsibility Matrix

```mermaid
graph LR
    %% Roles
    subgraph "User Roles"
        R1[Editor Assistant - Maker]
        R2[Receptionist]
        R3[Editor - Checker]
        R4[Proof Reader]
    end

    %% Screens
    subgraph "Screens & Functions"
        S1[EI-01, EDC-01, TEA-01, ELU-01, CSS-01]
        S2[HCRSU-01]
        S3[PA-01, RHM-01]
        S4[PEC-01, ECR-01]
    end

    %% Connections
    R1 --> S1
    R2 --> S2
    R3 --> S3
    R4 --> S4

    %% Styling
    classDef roleClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef screenClass fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class R1,R2,R3,R4 roleClass
    class S1,S2,S3,S4 screenClass
```

## Feature Category Overview

```mermaid
pie title Feature Distribution by Category
    "Edition Management" : 7
    "Document Handling" : 8
    "Proofreading & Error Management" : 12
    "Revision & Approval" : 5
    "Content Management" : 8
    "Reporting & Notifications" : 5
```

## Workflow State Diagram

```mermaid
stateDiagram-v2
    [*] --> Edition_Initiation
    Edition_Initiation --> Edition_Details_Capture
    Edition_Details_Capture --> Title_Extraction_Addition
    Title_Extraction_Addition --> Edition_Letter_Upload

    Edition_Letter_Upload --> Hard_Copy_Receipt_Status
    Hard_Copy_Receipt_Status --> Proofreading_Allocation

    Proofreading_Allocation --> Proofreading_Error_Capture
    Proofreading_Error_Capture --> Error_Claim_Revision

    Error_Claim_Revision --> Revision_History_Maintenance
    Revision_History_Maintenance --> Content_Storage_Sharing

    Content_Storage_Sharing --> [*]

    %% Parallel processes
    state Parallel_Processing {
        Hard_Copy_Receipt_Status
        Proofreading_Allocation
    }

    %% Error handling
    state Error_Handling {
        Proofreading_Error_Capture
        Error_Claim_Revision
    }
```

## Data Flow Diagram

```mermaid
flowchart TD
    %% Data Sources
    DS1[Academic Year Data]
    DS2[Edition Details]
    DS3[Title Information]
    DS4[Document Files]
    DS5[Error Data]
    DS6[Content Data]

    %% Process Steps
    P1[EI-01<br/>Process]
    P2[EDC-01<br/>Process]
    P3[TEA-01<br/>Process]
    P4[ELU-01<br/>Process]
    P5[HCRSU-01<br/>Process]
    P6[PA-01<br/>Process]
    P7[PEC-01<br/>Process]
    P8[ECR-01<br/>Process]
    P9[RHM-01<br/>Process]
    P10[CSS-01<br/>Process]

    %% Data Flow
    DS1 --> P1
    DS2 --> P1
    P1 --> P2
    DS3 --> P2
    P2 --> P3
    P3 --> P4
    DS4 --> P4
    P4 --> P5
    P5 --> P6
    P6 --> P7
    DS5 --> P7
    P7 --> P8
    P8 --> P9
    P9 --> P10
    DS6 --> P10

    %% Styling
    classDef processClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef dataClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px

    class P1,P2,P3,P4,P5,P6,P7,P8,P9,P10 processClass
    class DS1,DS2,DS3,DS4,DS5,DS6 dataClass