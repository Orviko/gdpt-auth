// ---- Common FHIR R4 types ----

export type FhirReference = {
  reference?: string;
  display?: string;
};

export type FhirCoding = {
  system?: string;
  code?: string;
  display?: string;
};

export type FhirCodeableConcept = {
  coding?: FhirCoding[];
  text?: string;
};

export type FhirPeriod = {
  start?: string;
  end?: string;
};

export type FhirAnnotation = {
  text?: string;
  time?: string;
};

export type FhirQuantity = {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
};

// ---- OperationOutcome ----

export type FhirOperationOutcome = {
  resourceType: "OperationOutcome";
  issue?: {
    severity?: string;
    code?: string;
    details?: { text?: string };
    diagnostics?: string;
  }[];
};

// ---- Bundle ----

export type FhirBundleEntry<T> = {
  fullUrl?: string;
  resource: T | FhirOperationOutcome;
  search?: { mode?: "match" | "include" | "outcome" };
};

export type FhirBundle<T> = {
  resourceType: "Bundle";
  type: string;
  total?: number;
  entry?: FhirBundleEntry<T>[];
  link?: { relation: string; url: string }[];
};

// ---- Patient ----

export type HumanName = {
  text?: string;
  family?: string;
  given?: string[];
  use?: string;
};

export type FhirPatient = {
  resourceType: "Patient";
  id: string;
  name?: HumanName[];
  birthDate?: string;
  gender?: string;
  telecom?: { system?: string; value?: string; use?: string }[];
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    use?: string;
  }[];
  maritalStatus?: FhirCodeableConcept;
  communication?: { language?: FhirCodeableConcept; preferred?: boolean }[];
};

// ---- Condition ----

export type FhirCondition = {
  resourceType: "Condition";
  id: string;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  severity?: FhirCodeableConcept;
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  onsetDateTime?: string;
  onsetPeriod?: FhirPeriod;
  abatementDateTime?: string;
  recordedDate?: string;
  note?: FhirAnnotation[];
};

// ---- AllergyIntolerance ----

export type FhirAllergyIntolerance = {
  resourceType: "AllergyIntolerance";
  id: string;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  type?: string;
  category?: string[];
  criticality?: "low" | "high" | "unable-to-assess";
  code?: FhirCodeableConcept;
  patient?: FhirReference;
  onsetDateTime?: string;
  recordedDate?: string;
  reaction?: {
    substance?: FhirCodeableConcept;
    manifestation?: FhirCodeableConcept[];
    severity?: "mild" | "moderate" | "severe";
  }[];
  note?: FhirAnnotation[];
};

// ---- MedicationRequest ----

export type FhirMedicationRequest = {
  resourceType: "MedicationRequest";
  id: string;
  status?: string;
  intent?: string;
  medicationCodeableConcept?: FhirCodeableConcept;
  medicationReference?: FhirReference;
  subject?: FhirReference;
  authoredOn?: string;
  requester?: FhirReference;
  dosageInstruction?: {
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    route?: FhirCodeableConcept;
    doseAndRate?: {
      doseQuantity?: FhirQuantity;
    }[];
  }[];
  note?: FhirAnnotation[];
};

// ---- Observation ----

export type FhirObservation = {
  resourceType: "Observation";
  id: string;
  status?: string;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  effectiveDateTime?: string;
  effectivePeriod?: FhirPeriod;
  valueQuantity?: FhirQuantity;
  valueString?: string;
  valueCodeableConcept?: FhirCodeableConcept;
  component?: {
    code?: FhirCodeableConcept;
    valueQuantity?: FhirQuantity;
    valueString?: string;
  }[];
  interpretation?: FhirCodeableConcept[];
  referenceRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
    text?: string;
  }[];
};

// ---- Immunization ----

export type FhirImmunization = {
  resourceType: "Immunization";
  id: string;
  status?: string;
  vaccineCode?: FhirCodeableConcept;
  patient?: FhirReference;
  occurrenceDateTime?: string;
  occurrenceString?: string;
  primarySource?: boolean;
  location?: FhirReference;
  lotNumber?: string;
  site?: FhirCodeableConcept;
  route?: FhirCodeableConcept;
  doseQuantity?: FhirQuantity;
  note?: FhirAnnotation[];
};

// ---- DiagnosticReport ----

export type FhirDiagnosticReport = {
  resourceType: "DiagnosticReport";
  id: string;
  status?: string;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  subject?: FhirReference;
  encounter?: FhirReference;
  effectiveDateTime?: string;
  effectivePeriod?: FhirPeriod;
  issued?: string;
  performer?: FhirReference[];
  result?: FhirReference[];
  conclusion?: string;
  conclusionCode?: FhirCodeableConcept[];
  presentedForm?: {
    contentType?: string;
    url?: string;
    title?: string;
  }[];
};
