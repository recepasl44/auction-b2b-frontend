import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ProductForm } from '@/components/products/product-form';
import { config } from '@/config';

// Next.js 13 "app router" için metadata örneği
export const metadata: Metadata = {
    title: `New Product | ${config.site.name}`
};

export default function Page(): React.JSX.Element {
    return (
        <Stack spacing={3}>
            <div>
                <Typography variant="h4">New Product</Typography>
            </div>
            {/* Form bileşenimizi ekliyoruz */}
            <ProductForm />
        </Stack>
    );
}
