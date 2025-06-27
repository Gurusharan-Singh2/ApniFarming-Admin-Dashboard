import React from "react";

export function Loader() {
  return (
    <>
<div className="h-screen w-full flex justify-center items-center ">

 <div className="fancy-loader" />
</div>
     
      <style jsx>{`
        .fancy-loader {
          width: 65px;
          aspect-ratio: 1;
          position: relative;
        }
        .fancy-loader::before,
        .fancy-loader::after {
          content: "";
          position: absolute;
          border-radius: 50px;
          box-shadow: 0 0 0 3px inset;
          animation: fancy-spin 2.5s infinite;
        }
        .fancy-loader::after {
          animation-delay: -1.25s;
        }

        @keyframes fancy-spin {
          0% {
            inset: 0 35px 35px 0;
          }
          12.5% {
            inset: 0 35px 0 0;
          }
          25% {
            inset: 35px 35px 0 0;
          }
          37.5% {
            inset: 35px 0 0 0;
          }
          50% {
            inset: 35px 0 0 35px;
          }
          62.5% {
            inset: 0 0 0 35px;
          }
          75% {
            inset: 0 0 35px 35px;
          }
          87.5% {
            inset: 0 0 35px 0;
          }
          100% {
            inset: 0 35px 35px 0;
          }
        }

        /* Light mode */
        @media (prefers-color-scheme: light) {
          .fancy-loader::before,
          .fancy-loader::after {
            box-shadow: 0 0 0 3px inset #000;
          }
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .fancy-loader::before,
          .fancy-loader::after {
            box-shadow: 0 0 0 3px inset #fff;
          }
        }
      `}</style>
    </>
  );
}
