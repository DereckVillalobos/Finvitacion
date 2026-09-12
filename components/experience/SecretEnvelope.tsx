export default function SecretEnvelope({
  onOpen,
  disabled,
}: {
  onOpen: () => void;
  disabled: boolean;
}) {
  return (
    <div className="envelope-stage">
      <div className="envelope-shadow" />
      <div className="envelope">
        <div className="envelope-back" />
        <div className="inner-letter">
          <span>para</span>
          <em>Fabi.</em>
          <div className="liquid-surface" />
        </div>
        <div className="envelope-front">
          <span className="envelope-name">Para Fabi</span>
          <span className="envelope-mark">F.</span>
        </div>
        <div className="envelope-flap" />
        <button
          className="seal-control"
          onClick={onOpen}
          disabled={disabled}
          aria-label="Romper el sello"
        >
          <span className="wax-seal">
            <span className="seal-half seal-left" />
            <span className="seal-half seal-right" />
            <span className="seal-imprint">f</span>
          </span>
          <span className="seal-instruction">
            Romper el sello <span>↗</span>
          </span>
        </button>
      </div>
    </div>
  );
}
