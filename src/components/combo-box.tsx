"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type OptionsType = { label: string; data: any }[];

interface ComboBoxProps {
  placeholder?: string;
  onSelect: (data: any) => void;
  options: OptionsType;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  className?: string;
  isPending?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  enableLocalSearch?: boolean;
  disabled?: boolean;
  value?: any;
}

export default function ComboBox({
  isError,
  options,
  onSelect,
  disabled = false,
  isPending,
  className,
  isSuccess,
  searchTerm,
  placeholder,
  setSearchTerm,
  enableLocalSearch = false,
  value,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    isAbove: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && !searchTerm) {
      let displayValue = "";
      if (typeof value === "object") {
        displayValue =
          value.primary_value || value.label || value.name || value.title || "";
      } else {
        displayValue = String(value);
      }
      setSearchTerm(displayValue);
    }
  }, [value, searchTerm, setSearchTerm]);

  const filteredOptions = useMemo(() => {
    if (!enableLocalSearch || !searchTerm.trim()) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm, enableLocalSearch]);

  useEffect(() => {
    const updateDropdownPosition = () => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const maxDropdownHeight = 240;
        const padding = 10;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const shouldPlaceAbove =
          spaceBelow < maxDropdownHeight + padding &&
          spaceAbove > maxDropdownHeight + padding;

        if (shouldPlaceAbove) {
          // Position initially, then adjust after dropdown renders
          setDropdownPosition({
            top: rect.top + window.scrollY - maxDropdownHeight - 2.5,
            left: rect.left + window.scrollX,
            width: rect.width,
            isAbove: true,
          });
        } else {
          setDropdownPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            isAbove: false,
          });
        }
      }
    };

    updateDropdownPosition();

    const handleResize = () => {
      updateDropdownPosition();
    };

    if (isOpen) {
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleCloseOpenedDropdown = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      let parentElement = inputRef.current?.parentElement;
      while (parentElement) {
        parentElement.addEventListener("scroll", handleCloseOpenedDropdown);
        parentElement = parentElement.parentElement;
      }

      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        let parentElement = inputRef.current?.parentElement;
        while (parentElement) {
          parentElement.removeEventListener(
            "scroll",
            handleCloseOpenedDropdown,
          );
          parentElement = parentElement.parentElement;
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      dropdownPosition.isAbove &&
      dropdownRef.current &&
      inputRef.current
    ) {
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const rect = inputRef.current.getBoundingClientRect();

      setDropdownPosition((prev) => ({
        ...prev,
        top: rect.top + window.scrollY - dropdownHeight - 2.5,
      }));
    }
  }, [
    isOpen,
    dropdownPosition.isAbove,
    options,
    filteredOptions,
    isPending,
    isError,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (option: { label: string; data: any }) => {
    onSelect(option.data);
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getInputClassName = () => {
    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${className}`;

    if (isError || (isSuccess && !options?.length)) {
      return cn(
        baseClasses,
        "border-red-500 focus:ring-red-500 focus:border-red-500",
      );
    }

    if (isSuccess) {
      return cn(
        baseClasses,
        "border-green-500 focus:ring-green-500 focus:border-green-500",
      );
    }

    if (isPending) {
      return cn(
        baseClasses,
        "border-blue-500 focus:ring-blue-500 focus:border-blue-500",
      );
    }

    return cn(
      baseClasses,
      "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
    );
  };

  const renderDropdownContent = () => {
    if (isPending) {
      return (
        <div className="flex items-center gap-2 p-3 text-sm text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          Error loading results
        </div>
      );
    }

    const optionsToRender = enableLocalSearch ? filteredOptions : options;

    if (optionsToRender?.length > 0) {
      return optionsToRender.map((option, index) => (
        <div
          key={index}
          className={cn(
            "cursor-pointer p-3 text-sm transition-colors duration-150 hover:bg-gray-100",
            !option.label && "cursor-not-allowed opacity-60",
          )}
          onClick={() => option.label && handleSelect(option)}
        >
          {option.label || "N/A"}
        </div>
      ));
    }

    return (
      <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
        <Search className="h-4 w-4" />
        No results found
      </div>
    );
  };

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute z-50 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg",
        dropdownPosition.isAbove ? "mb-[2.5px]" : "mt-[2.5px]",
      )}
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
      }}
    >
      {renderDropdownContent()}
    </div>
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Search..."}
          className={getInputClassName()}
          disabled={disabled}
        />
      </div>

      {createPortal(dropdownContent, document.body)}
    </div>
  );
}
