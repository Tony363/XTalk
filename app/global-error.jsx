"use client";
import Error from "next/error";

export default function GlobalError() {
  return (
    <html>
      <body>
        <Error />
      </body>
    </html>
  );
}
