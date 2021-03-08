import React from "react";
import { PageHeader, Avatar } from "antd";

// displays a page header

export default function Header() {
  return (
    <a href="/">
      <PageHeader title="⏳ TimeKeeper" subTitle="A Time management tool" style={{ cursor: "pointer" }} />
    </a>
  );
}
