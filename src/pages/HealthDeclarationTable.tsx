import React, { useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import api from '../api/axios';
import type HealthDeclaration  from '../interface/health-declaration.interface';
const columns = [
  { id: 'name', label: 'Name' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'contactWithInfected', label: 'Contact with F0' },
  { id: 'createdAt', label: 'Created At' },
];



const HealthDeclarationTable = () => {

  const [data, setData] = React.useState<HealthDeclaration[]>([]);
  useEffect(() => {
  const fetchHealthDeclarations = async () => {
    try {
      const response = await api.get('/health-declaration');
      setData(response.data);
    } catch (error) {
      console.error("Error fetching health declarations:", error);
    }
  };

  fetchHealthDeclarations();
},[])
  return (
    <TableContainer component={Paper} sx={{ maxWidth: 800, margin: '40px auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align="center">{col.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">{row.temperature}°C</TableCell>
              <TableCell align="center">{row.symptoms.length ? row.symptoms.join(', ') : 'No'}</TableCell>
              <TableCell align="center">{row.contactWithInfected ? 'Yes' : 'No'}</TableCell>
              <TableCell align="center">
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default HealthDeclarationTable;