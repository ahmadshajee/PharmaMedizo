import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Chip,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Medicine, MedicineStatus } from '../types/prescription';

interface MedicineChecklistProps {
  medicines: Medicine[];
  statuses: MedicineStatus[];
  onStatusChange: (medicineName: string, status: MedicineStatus['status']) => void;
  disabled?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: '#757575',
    bgColor: '#f5f5f5',
    icon: <HourglassEmptyIcon />,
  },
  given: {
    label: 'Given',
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    icon: <CheckCircleIcon />,
  },
  not_available: {
    label: 'Not Available',
    color: '#f57c00',
    bgColor: '#fff3e0',
    icon: <CancelIcon />,
  },
  not_needed: {
    label: 'Not Needed',
    color: '#d32f2f',
    bgColor: '#ffebee',
    icon: <BlockIcon />,
  },
};

const MedicineChecklist: React.FC<MedicineChecklistProps> = ({
  medicines,
  statuses,
  onStatusChange,
  disabled = false,
}) => {
  const getStatus = (medicineName: string): MedicineStatus['status'] => {
    const found = statuses.find(s => s.medicineName === medicineName);
    return found?.status || 'pending';
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
        Medicine Checklist
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Select ONE status for each medicine (options are mutually exclusive)
      </Typography>

      {medicines.map((medicine, index) => {
        const currentStatus = getStatus(medicine.name);
        const config = statusConfig[currentStatus];

        return (
          <Paper
            key={index}
            sx={{
              p: 2,
              mb: 2,
              borderLeft: `4px solid ${config.color}`,
              bgcolor: config.bgColor,
              transition: 'all 0.2s',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {medicine.name}
                </Typography>
                {medicine.dosage && (
                  <Typography variant="body2" color="textSecondary">
                    Dosage: {medicine.dosage}
                  </Typography>
                )}
                {medicine.frequency && (
                  <Typography variant="body2" color="textSecondary">
                    Frequency: {medicine.frequency}
                  </Typography>
                )}
                {medicine.duration && (
                  <Typography variant="body2" color="textSecondary">
                    Duration: {medicine.duration}
                  </Typography>
                )}
                {medicine.instructions && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    Instructions: {medicine.instructions}
                  </Typography>
                )}
              </Box>
              <Chip
                icon={config.icon}
                label={config.label}
                size="small"
                sx={{
                  bgcolor: 'white',
                  color: config.color,
                  border: `1px solid ${config.color}`,
                  '& .MuiChip-icon': {
                    color: config.color,
                  },
                }}
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <FormControl component="fieldset" disabled={disabled}>
              <RadioGroup
                row
                value={currentStatus}
                onChange={(e) => onStatusChange(medicine.name, e.target.value as MedicineStatus['status'])}
              >
                <FormControlLabel
                  value="given"
                  control={
                    <Radio
                      sx={{
                        color: '#2e7d32',
                        '&.Mui-checked': { color: '#2e7d32' },
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CheckCircleIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                      <Typography variant="body2">Given</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="not_available"
                  control={
                    <Radio
                      sx={{
                        color: '#f57c00',
                        '&.Mui-checked': { color: '#f57c00' },
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CancelIcon sx={{ fontSize: 18, color: '#f57c00' }} />
                      <Typography variant="body2">Not Available</Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="not_needed"
                  control={
                    <Radio
                      sx={{
                        color: '#d32f2f',
                        '&.Mui-checked': { color: '#d32f2f' },
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <BlockIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
                      <Typography variant="body2">Not Needed</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        );
      })}
    </Box>
  );
};

export default MedicineChecklist;
