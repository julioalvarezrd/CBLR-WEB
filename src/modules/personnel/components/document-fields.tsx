"use client";

import { useState } from "react";

import {
  DOCUMENT_TYPE_OPTIONS,
  type DocumentTypeValue,
} from "@/modules/personnel/constants";

export function formatCedulaInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}

type DocumentFieldsProps = {
  inputClassName: string;
  labelClassName: string;
  hintClassName: string;
  initialType?: DocumentTypeValue;
  initialValue?: string | null;
};

export function DocumentFields({
  inputClassName,
  labelClassName,
  hintClassName,
  initialType = "CEDULA",
  initialValue = "",
}: DocumentFieldsProps) {
  const [documentType, setDocumentType] = useState<DocumentTypeValue>(initialType);
  const [documentNumber, setDocumentNumber] = useState(() =>
    initialType === "CEDULA" ? formatCedulaInput(initialValue ?? "") : initialValue ?? "",
  );

  return (
    <>
      <div>
        <label htmlFor="documentType" className={labelClassName}>Tipo de documento</label>
        <select
          id="documentType"
          name="documentType"
          required
          value={documentType}
          onChange={(event) => {
            const nextType = event.target.value as DocumentTypeValue;
            setDocumentType(nextType);
            setDocumentNumber((current) =>
              nextType === "CEDULA" ? formatCedulaInput(current) : current,
            );
          }}
          className={inputClassName}
        >
          {DOCUMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="documentNumber" className={labelClassName}>Número de documento</label>
        <input
          id="documentNumber"
          name="documentNumber"
          value={documentNumber}
          onChange={(event) =>
            setDocumentNumber(
              documentType === "CEDULA"
                ? formatCedulaInput(event.target.value)
                : event.target.value.slice(0, 50),
            )
          }
          inputMode={documentType === "CEDULA" ? "numeric" : "text"}
          autoComplete="off"
          placeholder={documentType === "CEDULA" ? "000-0000000-0" : "Número de pasaporte"}
          required={documentType === "CEDULA"}
          maxLength={documentType === "CEDULA" ? 13 : 50}
          className={inputClassName}
        />
        <p className={hintClassName}>
          {documentType === "CEDULA"
            ? "La cédula se formatea automáticamente."
            : "El pasaporte conserva su formato original."}
        </p>
      </div>
    </>
  );
}
