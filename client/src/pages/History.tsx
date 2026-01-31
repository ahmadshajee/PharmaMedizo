import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { getDispensingHistory } from '../services/api';
import { Prescription } from '../types/prescription';

const History: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchHistory();
  }, [page, rowsPerPage, statusFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getDispensingHistory(page + 1, rowsPerPage, statusFilter || undefined);
      setPrescriptions(response.prescriptions);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dispensed':
        return 'success';
      case 'partially_dispensed':
        return 'warning';
      case 'active':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <HistoryIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#2e7d32' }}>
            Dispensing History
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="dispensed">Dispensed</MenuItem>
            <MenuItem value="partially_dispensed">Partially Dispensed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress sx={{ color: '#2e7d32' }} />
          </Box>
        ) : prescriptions.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="textSecondary">
              No dispensing history found.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Prescription ID</strong></TableCell>
                    <TableCell><strong>Patient</strong></TableCell>
                    <TableCell><strong>Diagnosis</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Dispensed At</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow
                      key={prescription._id}
                      hover
                      sx={{ '&:hover': { bgcolor: '#e8f5e9' } }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {prescription._id.substring(0, 12)}...
                        </Typography>
                      </TableCell>
                      <TableCell>{prescription.patientEmail || 'N/A'}</TableCell>
                      <TableCell>{prescription.diagnosis || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={prescription.status.replace('_', ' ').toUpperCase()}
                          size="small"
                          color={getStatusColor(prescription.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {prescription.validatedAt
                          ? new Date(prescription.validatedAt).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default History;
