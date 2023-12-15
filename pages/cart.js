import Button from "@/components/Button";
import { CartContext } from "@/components/CartContext";
import Center from "@/components/Center";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Table from "@/components/Table";
import CartIcon from "@/components/icons/CartIcon";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1.2fr .8fr;
  }
  gap: 40px;
  margin-top: 40px;
`;

const Box = styled.div`
    background-color: #fff;
    border-radius: 10px;
    padding: 30px;
`;

const ProductInfoCell = styled.td`
    padding: 10px 10px 10px 10px;
`;


const ProductImageBox = styled.div`
  width: 115px; 
  height: 100px;
  padding: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display:flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  img{
    max-width: 90px;
    max-height: 90px;
  }
  @media screen and (min-width: 768px) {
    padding: 10px;
    width: 100px;
    height: 100px;
    img{
      max-width: 80px;
      max-height: 80px;
    }
  }
  margin-bottom: 10px;
`;


const QuantityLabel = styled.span`
  padding: 0 10px;
  display: block;
  margin: 2%;
  @media screen and (min-width: 768px) {
    display: inline-block;
    padding: 0 10px;
  }
`;

const CityHolder = styled.div`
    display: flex;
    gap: 5px;

`;

export default function CartPage() {
    const { cartProducts, addProduct, removeProduct, clearCart } = useContext(CartContext);
    const {data:session} = useSession();
    const [products, setProducts] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (cartProducts.length > 0) {
          axios.post('/api/cart', {ids:cartProducts})
            .then(response => {
              setProducts(response.data);
            })
        } else {
          setProducts([]);
        }
      }, [cartProducts]);

      
      useEffect(() => {
        if (typeof window === 'undefined') {
          return;
        }
        if (window?.location.href.includes('success')) {
          setIsSuccess(true);
          clearCart();
        }
      }, []);

      useEffect(() => {
        if (!session) {
          return;
        }
        axios.get('/api/address').then(response => {
          setName(response.data.name);
          setEmail(response.data.email);
          setCity(response.data.city);
          setPostalCode(response.data.postalCode);
          setStreetAddress(response.data.streetAddress);
          setState(response.data.state);
          setCountry(response.data.country);
        });
      }, [session]);


    function moreOfThisProduct(id) {
        addProduct(id);
    }

    function lessOfThisProduct(id) {
        removeProduct(id);
    }

    async function goToPayment() {
        const response = await axios.post('/api/checkout', {
            name, email, city, postalCode, streetAddress, state, country, cartProducts,
        });

        if (response.data.url) {

            window.location = response.data.url;
        }

    }
    let total = 0;
    for (const productId of cartProducts) {
        const price = products.find(p => p._id === productId)?.price || 0;
        total += price;
    }

    if (isSuccess) {
        return (
            <>
                <Header />
                <Center>
                    <Box>
                        <h1>Thanks for your order!</h1>
                        <p>We will email you once your order is dispatched.</p>
                    </Box>
                </Center>
            </>
        );
    }

    return (
        <>
            <Header />
            <ToastContainer />
            <Center>
                <ColumnsWrapper>
                    <Box>
                        <h2>Your shopping cart</h2>
                        {!cartProducts?.length && (
                            <div>Your cart is empty</div>
                        )}
                        {products?.length > 0 && (
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {products.map(product => (
                                        <tr key={product._id}>
                                            <ProductInfoCell>
                                                <ProductImageBox>
                                                    <img src={product.images[0]} alt="product-image" />
                                                </ProductImageBox>
                                                {product.title}
                                            </ProductInfoCell>
                                            <td>
                                                <Button onClick={() => lessOfThisProduct(product._id)}>-</Button>
                                                <QuantityLabel>
                                                    {cartProducts.filter(id => id === product._id).length}
                                                </QuantityLabel>
                                                <Button
                                                    onClick={() => moreOfThisProduct(product._id)
                                                    }>+</Button>
                                            </td>
                                            <td>
                                                ₹{cartProducts.filter(id => id === product._id).length * product.price}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr></tr>
                                    <tr></tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td>₹{total}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        )}

                    </Box>
                    {!!cartProducts?.length && (
                        <Box>
                            <h2>Order Information</h2>



                            <Input type="text" placeholder="Name" value={name} name="name" onChange={ev => setName(ev.target.value)} />
                            <Input type="text" placeholder="Email" value={email} name="email" onChange={ev => setEmail(ev.target.value)} />

                            <CityHolder>
                                <Input type="text" placeholder="City" value={city} name="city" onChange={ev => setCity(ev.target.value)} />
                                <Input type="text" placeholder="Postal Code" value={postalCode} name="postalCode" onChange={ev => setPostalCode(ev.target.value)} />
                            </CityHolder>

                            <Input type="text" placeholder="Address" value={streetAddress} name="streetAddress" onChange={ev => setStreetAddress(ev.target.value)} />
                            <Input type="text" placeholder="State" value={state} name="state" onChange={ev => setState(ev.target.value)} />
                            <Input type="text" placeholder="Country" value={country} name="country" onChange={ev => setCountry(ev.target.value)} />

                            <Button black block onClick={goToPayment}> Continue to payment</Button>

                        </Box>
                    )}
                </ColumnsWrapper>
            </Center>
        </>
    );
}