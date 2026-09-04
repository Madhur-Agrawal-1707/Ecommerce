"use client";

import { useEffect } from "react";

export function PrintAction() {
  useEffect(() => {
    // Small delay to ensure styles and images are loaded
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const btn = document.getElementById("manual-print-btn");
    if (btn) {
      btn.onclick = () => window.print();
    }
  }, []);

  return null;
}
