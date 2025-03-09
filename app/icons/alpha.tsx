type IconProps = {
  className: string;
};

export function AlphaIcon(props: IconProps) {
  return (
    <svg
      className={props.className}
      width="30"
      height="9"
      viewBox="0 0 60 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 14V10H5V14H3V4H5V2H7V0H9V2H11V4H13V14H11ZM5 8H11V4H9V2H7V4H5V8Z"
        fill="#1E1E1E"
      />
      <path
        d="M14.9922 14V12H16.9922V2H14.9922V0H18.9922V12H20.9922V14H14.9922Z"
        fill="#1E1E1E"
      />
      <path
        d="M23 18V4H25V6H27V4H31V6H33V12H31V6H27V8H25V10H27V12H31V14H27V12H25V18H23Z"
        fill="#1E1E1E"
      />
      <path
        d="M42.9922 14V6H38.9922V8H36.9922V14H34.9922V0H36.9922V6H38.9922V4H42.9922V6H44.9922V14H42.9922Z"
        fill="#1E1E1E"
      />
      <path
        d="M46.9844 12V10H48.9844V8H54.9844V6H48.9844V4H54.9844V6H56.9844V14H48.9844V12H46.9844ZM48.9844 12H54.9844V10H48.9844V12Z"
        fill="#1E1E1E"
      />
    </svg>
  );
}
