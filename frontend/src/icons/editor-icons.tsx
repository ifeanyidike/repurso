type Props = {
  width?: string;
  height?: string;
  viewBox?: string;
  strokeColor?: string;
  fillColor?: string;
};

export const PlayIcon = (props: Props) => {
  const { width = '24', height = '24', viewBox = '0 0 24 24' } = props;
  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none">
      <path
        d="M12 0C18.6274 0 24 5.37257 24 12C24 18.6274 18.6274 24 12 24C5.37257 24 0 18.6274 0 12C0 5.37257 5.37257 0 12 0Z"
        fill="#fff"
      />
      <path
        d="M8.70607 16.2461C8.70562 16.4132 8.75023 16.5773 8.83521 16.7211C8.92019 16.8649 9.04239 16.9832 9.18893 17.0633C9.33009 17.1448 9.49022 17.1877 9.65321 17.1877C9.81622 17.1877 9.97634 17.1448 10.1175 17.0633L16.7939 12.699C16.9243 12.6149 17.0314 12.4994 17.1056 12.3631C17.1798 12.2269 17.2187 12.0742 17.2187 11.919C17.2187 11.7639 17.1798 11.6112 17.1056 11.475C17.0314 11.3387 16.9243 11.2232 16.7939 11.139L10.0989 6.8119C9.95777 6.7304 9.79764 6.6875 9.63464 6.6875C9.47165 6.6875 9.31152 6.7304 9.17036 6.8119C9.02382 6.89208 8.90162 7.01031 8.81664 7.15412C8.73166 7.29793 8.68705 7.462 8.6875 7.62904L8.70607 16.2461Z"
        fill="#1F1919"
      />
    </svg>
  );
};

export const PauseIcon = (props: Props) => {
  const {
    width = '24',
    height = '24',
    viewBox = '0 0 24 24',
    fillColor = '#fff',
  } = props;
  return (
    <svg width={width} height={height} viewBox={viewBox} fill={fillColor}>
      <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
    </svg>
  );
};

export const PlayIconAlt = (props: Props) => {
  const {
    width = '40',
    height = '40',
    viewBox = '0 0 24 24',
    fillColor = '#fff',
  } = props;
  return (
    <svg width={width} height={height} viewBox={viewBox} fill={fillColor}>
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export const PlayIconAlt2 = (props: Props) => {
  const {
    width = '40',
    height = '40',
    viewBox = '0 0 24 24',
    fillColor = '#fff',
  } = props;
  return (
    <svg width={width} height={height} viewBox="0 0 384 512">
      <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
    </svg>
  );
};
