from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Product Name")
    slug = models.SlugField(max_length=255, unique=True, help_text="A URL-friendly short label for the product.")
    brand = models.CharField(max_length=100, default='Unbranded')
    short_description = models.TextField(max_length=500, verbose_name="Short Summary")
    long_description = models.TextField(verbose_name="Detailed Description")
    theme = models.CharField(max_length=100, blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Retail Price")
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="Discount %")
    stock_quantity = models.IntegerField(default=0, verbose_name="Available Stock")
    
    # Status
    is_available = models.BooleanField(default=True, verbose_name="Is Available Online")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_discounted_price(self):
        """Calculates the final price after applying the discount."""
        discount_amount = self.price * (self.discount_percent / 100)
        return self.price - discount_amount

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    """
    Stores multiple images for a single product.
    """
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images/')
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_main = models.BooleanField(default=False, verbose_name="Main Display Image")
    order = models.PositiveIntegerField(default=0, help_text="Order in which image is displayed.")

    class Meta:
        ordering = ['order']
        unique_together = ('product', 'order')

    def __str__(self):
        return f"Image for {self.product.name} (Order {self.order})"

class ProductFeature(models.Model):
    """
    Stores flexible, key-value pairs of features and use cases (e.g., King size: 5cm, Use Case: Educational).
    """
    product = models.ForeignKey(Product, related_name='features', on_delete=models.CASCADE)
    feature_name = models.CharField(max_length=100, help_text="e.g., Material, King Size, Use Case")
    feature_value = models.TextField(help_text="e.g., Wood, 5 cm, Educational Game")
    
    def __str__(self):
        return f"{self.product.name} - {self.feature_name}"
