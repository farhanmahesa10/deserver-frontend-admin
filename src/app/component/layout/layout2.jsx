"use client";

import Header from "./header";
import Sidebar from "./sidebar";
import React, { useState } from "react";

export default function Layout2() {
  const [isOpen, setIsOpen] = useState(false);

  const onClickHeader = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Header isOpen={isOpen} onClickHeader={onClickHeader} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}
