"use client";

import React from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useRouter } from 'next/navigation';
import axiosClient from '@/services/axiosClient';
import { paths } from '@/paths';

const PRODUCT_CONFIG = {
  'Wheat Flour': {
    flourTypeOptions: ['All Purpose Flour', 'Bread Flour', 'Baguette Flour', 'Biscuit Flour', 'Cake & Pastry Flour'],
    packageSizeOptions: ['1 kg', '10 kg', '25 kg', '50 kg'],
  },
  Spaghetti: {
    packageSizeOptions: ['200 gr', '250 gr', '400 gr', '500 gr', '5 kg'],
    qualityOptions: ['%100 hard durum wheat', '%30 hard durum wheat + %70 soft wheat', '%100 soft wheat'],
  },
  'Short-cut Pasta': {
    packageSizeOptions: ['250 gr', '400 gr', '500 gr', '5 kg'],
    qualityOptions: ['%100 hard durum wheat', '%30 hard durum wheat + %70 soft wheat', '%100 soft wheat'],
  },
  'Sunflower Oil': {
    packageSizeOptions: [
      '700 ml Round Pet Bottle',
      '1 lt Round Pet Bottle',
      '1.5 lt Handled Pet Bottle',
      '1.8 lt Handled Pet Bottle',
      '2 lt Round Pet Bottle',
      '3 lt Cornered Pet Bottle',
      '4 lt Cornered Pet Bottle',
      '5 lt Cornered Pet Bottle',
      '5 lt Round Pet Bottle',
      '10 lt Tin',
      '18 lt Tin',
    ],
  },
  'Fresh Egg': {
    productQualityOptions: [
      'Classic Small Egg',
      'Classic Medium Egg',
      'Classic Large Egg',
      'Cage Free Egg',
      'Omega Egg',
      'Selenious Egg',
    ],
    quantityInCartonOptions: ['10 Pieces', '15 Pieces', '30 Pieces'],
  },
} as const;

type Category = keyof typeof PRODUCT_CONFIG;

const categoryOptions: Category[] = [
  'Wheat Flour',
  'Spaghetti',
  'Short-cut Pasta',
  'Sunflower Oil',
  'Fresh Egg',
];

export default function ProductionRequestCreatePage(): React.JSX.Element {
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [productId, setProductId] = React.useState<number | null>(null);
  const router = useRouter();
const [openModal, setOpenModal] = React.useState(false);
  const [form, setForm] = React.useState({
    category: '' as Category | '',
    description: '',
    flourType: '',
    name: '',
    packageSize: '',
    quality: '',
    gluten: '',
    protein: '',
    ash: '',
    moisture: '',
    productQuality: '',
    quantityInCarton: '',
    priceType: '',
    destinationPort: '',
    orderQuantity: '',
  });

  const formatLabel = (label: string) =>
    label.charAt(0).toUpperCase() + label.slice(1);
 const handleModalClose = () => {
    setOpenModal(false);
   router.push('/productionRequests/list');
  };
const formatValue = (key: string, value: string) => {
  if (['gluten', 'ash', 'moisture'].includes(key)) return `${value}%`;
  if (key === 'protein') return `${value} g`;
  return value;
};
  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('category', form.category);
      formData.append('name', form.name);
      formData.append('description', form.category);

      formData.append('priceType', form.priceType);
      formData.append('destinationPort', form.destinationPort);
      formData.append('orderQuantity', form.orderQuantity);
      const attributes: Record<string, string> = {};
      if (form.flourType) attributes['Flour Type'] = form.flourType;
      if (form.packageSize) attributes['Package Size'] = form.packageSize;
      if (form.quality) attributes['Quality'] = form.quality;
      if (form.productQuality) attributes['Product Quality'] = form.productQuality;
      if (form.quantityInCarton) attributes['Quantity in Carton'] = form.quantityInCarton;
      if (form.gluten) attributes['Gluten'] = form.gluten;
      if (form.protein) attributes['Protein'] = form.protein;
      if (form.ash) attributes['Ash'] = form.ash;
      if (form.moisture) attributes['Moisture'] = form.moisture;
      formData.append('attributes', JSON.stringify(attributes));

      const res = await axiosClient.post<{ productId: number }>('/products', formData);
      const id = res.data?.productId;
      console.log('Product created with ID:', id);
      setProductId(id);
      handleNext();
      
    } catch (err: any) {
      console.error('Error creating product:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      await axiosClient.post('/productionRequests', { productId });
      toast.success('Production request created successfully.');
      setOpenModal(true); 
    } catch (err: any) {
      console.error('Error creating production request:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCategoryFields = () => {
    if (!form.category) return null;
    const config = PRODUCT_CONFIG[form.category as Category];
    return (
      <>
        {'flourTypeOptions' in config && (
            <Grid xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Flour Type</InputLabel>
              <Select
              label="Flour Type"
              value={form.flourType}
              onChange={(e) => handleChange('flourType', e.target.value)}
              >
              {form.flourType === "" && (
                <MenuItem value="">
                <em>Select the flour type</em>
                </MenuItem>
              )}
              {config.flourTypeOptions!.map((opt) => (
                <MenuItem key={opt} value={opt}>
                {opt}
                </MenuItem>
              ))}
              </Select>
              <FormHelperText>Please select the flour type</FormHelperText>
            </FormControl>
            </Grid>
        )}

        {'packageSizeOptions' in config && (
          <Grid xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Package Size</InputLabel>
              <Select
                label="Package Size"
                value={form.packageSize}
                onChange={(e) => handleChange('packageSize', e.target.value)}
              >
                {config.packageSizeOptions!.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Please select the package size</FormHelperText>
            </FormControl>
          </Grid>
        )}

        {'qualityOptions' in config && (
          <Grid xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Quality</InputLabel>
              <Select
                label="Quality"
                value={form.quality}
                onChange={(e) => handleChange('quality', e.target.value)}
              >
                {config.qualityOptions!.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
                            <FormHelperText>Please select the quality of wheat content</FormHelperText>

            </FormControl>
          </Grid>
        )}

        {'productQualityOptions' in config && (
          <Grid xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Product Quality</InputLabel>
              <Select
                label="Product Quality"
                value={form.productQuality}
                onChange={(e) => handleChange('productQuality', e.target.value)}
              >
                {config.productQualityOptions!.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {'quantityInCartonOptions' in config && (
          <Grid xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Quantity in Carton</InputLabel>
              <Select
                label="Quantity in Carton"
                value={form.quantityInCarton}
                onChange={(e) => handleChange('quantityInCarton', e.target.value)}
              >
                {config.quantityInCartonOptions!.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Please select the carton type</FormHelperText>
            </FormControl>
          </Grid>
        )}

        {'flourTypeOptions' in config && (
          <>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gluten</InputLabel>
                <OutlinedInput
                  label="Gluten"
                  placeholder="Enter the value you need"
                  value={form.gluten}
                  onChange={(e) => handleChange('gluten', e.target.value)}
                />
                <FormHelperText>% value</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Protein</InputLabel>
                <OutlinedInput
                  label="Protein"
                  placeholder="Enter the value you need"
                  value={form.protein}
                  onChange={(e) => handleChange('protein', e.target.value)}
                />
                <FormHelperText>gram value</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ash</InputLabel>
                <OutlinedInput
                  label="Ash"
                  placeholder="Enter the value you need"
                  value={form.ash}
                  onChange={(e) => handleChange('ash', e.target.value)}
                />
                <FormHelperText>% value</FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Moisture</InputLabel>
                <OutlinedInput
                  label="Moisture"
                  placeholder="Enter the value you need"
                  value={form.moisture}
                  onChange={(e) => handleChange('moisture', e.target.value)}
                />
                <FormHelperText>% value</FormHelperText>
              </FormControl>
            </Grid>
          </>
        )}
      </>
    );
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        <Step>
          <StepLabel>Details</StepLabel>
        </Step>
        <Step>
          <StepLabel>Review</StepLabel>
        </Step>
      </Stepper>

      {activeStep === 0 && (
        <form onSubmit={handleStepOneSubmit}>
          <Card>
            <CardHeader title="Request Details" subheader="Specify your product requirements" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      value={form.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                    >
                      {categoryOptions.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                     <Grid xs={12} md={6}>
                      <FormControl fullWidth required>
                      <TextField
                        label="Name"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        fullWidth
                      />
                      </FormControl>
                    </Grid>
                {renderCategoryFields()}

                <Grid xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Price Type</InputLabel>
                    <Select
                      label="Price Type"
                      value={form.priceType}
                      onChange={(e) => handleChange('priceType', e.target.value)}
                    >
                      <MenuItem value=""> </MenuItem>
                      <MenuItem value="CIF">CIF</MenuItem>
                      <MenuItem value="FOB">FOB</MenuItem>
                    </Select>
                    <FormHelperText>Please select the type of pricing</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Destination Port</InputLabel>
                    <OutlinedInput
                      label="Destination Port"
                      placeholder="Please enter the name of destination port"
                      value={form.destinationPort}
                      onChange={(e) => handleChange('destinationPort', e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Order Quantity</InputLabel>
                    <OutlinedInput
                      label="Order Quantity"
                      placeholder="Please enter number of containers you would like to order"
                      type="number"
                      value={form.orderQuantity}
                      onChange={(e) => handleChange('orderQuantity', e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                  label="Description"
                  placeholder="Please write any detailed information you would like to add"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end' }}>
               <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Next'}
              </Button>
            </CardActions>
          </Card>
        </form>
      )}

      {activeStep === 1 && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader title="Review" subheader="Confirm details before submitting" />
            <Divider />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(form).map(([key, value]) =>
                  value ? (
                    <Typography key={key}>{`${formatLabel(key)}: ${formatValue(
                      key,
                      value as string
                    )}`}</Typography>
                  ) : null
                )}
                {errorMessage && <Typography color="error">{errorMessage}</Typography>}
              </Box>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Button onClick={handleBack} disabled={submitting} variant="outlined">
                Back
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </CardActions>
          </Card>
        </form>
      )}
     <Dialog open={openModal} onClose={handleModalClose}>
      <DialogTitle>İşlem Tamam</DialogTitle>
       <DialogContent>
          <Typography>
            Üretim talebiniz alınmıştır. Taleplerinizi inceleyeceğiniz sayfaya
            yönlendiriliyorsunuz.
         </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} variant="contained" autoFocus>
            Tamam
          </Button>
       </DialogActions>
      </Dialog>
   </Box>
  );
}