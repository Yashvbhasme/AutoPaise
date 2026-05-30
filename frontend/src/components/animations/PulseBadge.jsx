const PulseBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      dot: 'bg-emerald-500',
      pulse: 'bg-emerald-400',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Active',
      showPulse: true
    },
    'Pending Approval': {
      dot: 'bg-amber-500',
      pulse: 'bg-amber-400',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Pending Approval',
      showPulse: true
    },
    Pending: {
      dot: 'bg-amber-500',
      pulse: 'bg-amber-400',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Pending',
      showPulse: true
    },
    Paused: {
      dot: 'bg-gray-400',
      pulse: 'bg-gray-300',
      text: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      label: 'Paused',
      showPulse: false
    },
    Cancelled: {
      dot: 'bg-red-500',
      pulse: 'bg-red-400',
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Cancelled',
      showPulse: false
    },
    Failed: {
      dot: 'bg-red-500',
      pulse: 'bg-red-400',
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Failed',
      showPulse: false
    }
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      {/* Pulse dot */}
      <span className="relative flex h-2 w-2">
        {config.showPulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pulse}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}
        />
      </span>
      {config.label}
    </span>
  );
};

export default PulseBadge;
