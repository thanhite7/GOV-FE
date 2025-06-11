import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Checkbox, FormControlLabel, Typography, Box, Radio, RadioGroup, FormControl, FormLabel } from '@mui/material';
import type HealthDeclarationInput from '../interface/health-declaration.interface';
import api from '../api/axios';
import { toastSuccess, toastError } from '../utils/toast';
import { handleApiError } from '../utils/errorHandler';
const SYMPTOM_OPTIONS = [
  'Cough',
  'Smell/taste impairment',
  'Fever',
  'Breathing difficulties',
  'Body aches',
  'Headaches',
  'Fatigue',
  'Sore throat',
  'Diarrhea',
  'Runny nose',
];

const HealthDeclarationForm = () => {
  const { handleSubmit, control, reset } = useForm<HealthDeclarationInput>({
    defaultValues: {
      name: '',
      temperature: 0,
      symptoms: [],
      contactWithInfected: false,
    },
    mode: 'onSubmit',
  });

  const onSubmit = async (data: HealthDeclarationInput) => {
    try {
      const formattedData = {
        ...data,
        temperature: parseFloat(data.temperature.toString())
      }
      await api.post('/health-declaration', formattedData);
      toastSuccess('Health declaration submitted successfully!');
      reset();
    } catch (error: unknown) {
      handleApiError(error, 'Failed to submit health declaration. Please try again later.');
    }
  };

  const onError = (errors: Record<string, any>) => {
    if (errors.name) toastError(errors.name.message);
    if (errors.temperature) toastError(errors.temperature.message);
    if (errors.contactWithInfected) toastError(errors.contactWithInfected.message);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit, onError)} sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'white' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Health Declaration Form
      </Typography>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Name is required' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Name"
            fullWidth
            margin="normal"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />        <Controller
        name="temperature"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Temperature (°C)"
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ step: 0.1, min: 34, max: 42 }}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
      <FormControl component="fieldset" margin="normal" sx={{ width: '100%', mt: 2 }}>
        <FormLabel component="legend">
          Do you have any of the following symptoms now or within the last 14 days?
        </FormLabel>
        <Controller
          name="symptoms"
          control={control}
          render={({ field }) => (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 2fr))', gap: 2, mt: 1 }}>
              {SYMPTOM_OPTIONS.map(option => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={field.value.includes(option)}
                      onChange={e => {
                        if (e.target.checked) {
                          field.onChange([...field.value, option]);
                        } else {
                          field.onChange(field.value.filter((v: string) => v !== option));
                        }
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </Box>
          )}
        />
      </FormControl>
      <FormControl component="fieldset" margin="normal" sx={{ width: '100%', mt: 2 }}>
        <FormLabel component="legend">
          Have you been in contact with anyone who is suspected to have/ has been diagnosed with Covid-19 within the last 14 days?
        </FormLabel>
        <Controller
          name="contactWithInfected"
          control={control}
          render={({ field }) => (
            <RadioGroup
              row
              value={field.value === true ? 'true' : 'false'} // Nếu không chọn thì mặc định là 'false'
              onChange={e => field.onChange(e.target.value === 'true')}
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          )}
        />
      </FormControl>
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
}

export default HealthDeclarationForm;