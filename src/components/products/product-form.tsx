'use client';

import * as React from 'react';
import {
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
    Grid,
    Typography
} from '@mui/material';
import axiosClient from '../../services/axiosClient';

// Örnek kategoriler (statik)
const categories = [
    { value: 'electronic', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'food', label: 'Food' },
    { value: 'books', label: 'Books' },
];

export function ProductForm() {
    const [productName, setProductName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [successMessage, setSuccessMessage] = React.useState('');

    // Submit handler
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Örneğin, POST /api/products
            // Body: { productName, description, price, category }
            const response = await axiosClient.post('/api/products', {
                productName,
                description,
                price: parseFloat(price),
                category,
            });
            console.log('Product created:', response.data);

            setSuccessMessage('Product created successfully!');
            // Formu sıfırlayalım
            setProductName('');
            setDescription('');
            setPrice('');
            setCategory('');
        } catch (err: any) {
            console.error('Error creating product:', err);
            // API’den bir hata mesajı gelebilir
            setErrorMessage(err.response?.data?.message || 'Failed to create product.');
        } finally {
            setLoading(false);
        }
    };

    // “Cancel” ya da “Reset” butonuna tıklandığında
    const handleReset = () => {
        setProductName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setErrorMessage('');
        setSuccessMessage('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader
                    title="Create Product"
                    subheader="Please fill out all required fields to add a new product to the inventory."
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Product Name</InputLabel>
                                <OutlinedInput
                                    label="Product Name"
                                    name="productName"
                                    value={productName}
                                    placeholder="Ex: iPhone 14 Pro Max"
                                    onChange={(e) => setProductName(e.target.value)}
                                />
                                <FormHelperText>
                                    Enter the official name of the product.
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Description</InputLabel>
                                <OutlinedInput
                                    label="Description"
                                    name="description"
                                    value={description}
                                    placeholder="Short description or specs"
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <FormHelperText>
                                    A brief summary or main features of the product.
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Price</InputLabel>
                                <OutlinedInput
                                    label="Price"
                                    name="price"
                                    type="number"
                                    placeholder="Ex: 499.99"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                                <FormHelperText>
                                    Specify the base price (numeric value).
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    label="Category"
                                    name="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as string)}
                                >
                                    {categories.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    Choose the product category from the list.
                                </FormHelperText>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Hata / Başarı Mesajları */}
                    {errorMessage && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    {successMessage && (
                        <Typography color="success.main" sx={{ mt: 2 }}>
                            {successMessage}
                        </Typography>
                    )}
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={handleReset}
                        disabled={loading}
                        sx={{ mr: 1 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </Button>
                </CardActions>
            </Card>
        </form>
    );
}
