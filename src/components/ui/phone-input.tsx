"use client";

import { useState } from "react";
import { formatPhoneInput } from "@/lib/phone";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">;

export function PhoneInput({ defaultValue, className, ...props }: Props) {
  const [value, setValue] = useState(() => formatPhoneInput(String(defaultValue ?? "")));

  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      className={className}
      onChange={(event) => setValue(formatPhoneInput(event.target.value))}
    />
  );
}
