'use client';
import { Box, Modal, Stack, TextField, Typography, Button, Tabs, Tab, Drawer, TableContainer, Table, TableHead, TableRow, Paper, TableCell, TableBody, ButtonGroup, IconButton, InputLabel, Checkbox } from "@mui/material";
import { query, collection, getDocs, getDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import Groq from "groq-sdk";


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [value, setValue] = useState(0);
  const [itemQuantity, setItemQuantity] = useState('')
  const [error, setError] = useState('')
  const [recipe, setRecipe] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  require('dotenv').config()

  const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, dangerouslyAllowBrowser: true });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach(doc => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItemQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      const { quantity } = docSnapshot.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }

    await updateInventory()
  }

  const addNewItem = async (item, quantity) => {
    if (isNaN(quantity)) {
      setError('Quantity must be a number')
      return
    }
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      const { quantity: existingQuantity } = docSnapshot.data()
      await setDoc(docRef, { quantity: existingQuantity + Number(quantity) })
    } else {
      await setDoc(docRef, { quantity: Number(quantity) })
    }

    await updateInventory()
    setError('')
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      const { quantity } = docSnapshot.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }

    await updateInventory()
  }

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    await deleteDoc(docRef)
    await updateInventory()
  }

  const generateRecipe = async () => {
    const inventoryItems = selectedItems.join(', ');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Generate a recipe using these ingredients: ${inventoryItems}. 
          Please proved a detailed recipe, including steps for preparation and cooking.
          Also include a title for the recipe`,
        },
      ],
      model: "llama3-8b-8192",
    });
    setRecipe(chatCompletion.choices[0]?.message?.content || "");
  }

  const handleCheck = (event, name) => {
    if (event.target.checked) {
      setSelectedItems([...selectedItems, name]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== name));
    }
  };

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [searchTerm, setSearchTerm] = useState('');

  const renderTabContent = () => {
    switch (value) {
      case 0:

        const filteredInventory = inventory.filter(({ name }) =>
          name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <>
            <Modal open={open} onClose={handleClose}>
              <Box
                position="absolute"
                top="50%"
                left="50%"
                width={400}
                bgcolor="white"
                border="2px solid #000"
                boxShadow={24}
                p={4}
                display="flex"
                flexDirection="column"
                gap={3}
                sx={{
                  transform: 'translate(-50%,-50%)',
                }}
              >
                <Typography variant="h6">Add Item</Typography>
                <Stack width="100%" direction="row" spacing={2}>

                  <Box width="100%">
                    <InputLabel htmlFor="name-input">Name</InputLabel>
                    <TextField
                      id="name-input"
                      variant="outlined"
                      fullWidth
                      value={itemName}
                      onChange={(e) => {
                        setItemName(e.target.value)
                      }}
                    >
                    </TextField>
                  </Box>

                  <Box width="100%">
                    <InputLabel htmlFor="quantity-input">Quantity</InputLabel>
                    <TextField
                      id="quantity-input"
                      variant="outlined"
                      fullWidth
                      value={itemQuantity}
                      onChange={(e) => {
                        const quantity = e.target.value;
                        if (isNaN(quantity)) {
                          setError('Quantity must be a number');
                        } else {
                          setError('');
                        }
                        setItemQuantity(quantity);
                      }}
                    >
                    </TextField>
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (!error) {
                        addNewItem(itemName.toLowerCase(), itemQuantity)
                        setItemName('')
                        setItemQuantity('')
                        handleClose()
                      }
                    }}
                    sx={{ backgroundColor: 'black', color: 'white', height: '100%' }}
                  >
                    Add
                  </Button>
                </Stack>
                {error && <Typography color="error">{error}</Typography>}
              </Box>
            </Modal>

            <Box
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h5">Inventory</Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <TextField
                variant="outlined"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{width: '25%', height: '2%' }}
              />
              <Button
                variant="contained"
                onClick={() => { handleOpen() }}
                sx={{ backgroundColor: 'black', color: 'white'}}
              >
                Add New Item
              </Button>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map(({ name, quantity }) => (
                    <TableRow key={name}>
                      <TableCell component="th" scope="row">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </TableCell>
                      <TableCell align="center">{quantity}</TableCell>
                      <TableCell align="right">
                        <ButtonGroup variant="contained">
                          <Button
                            sx={{ backgroundColor: 'black', color: 'white' }}
                            onClick={() => {
                              addItemQuantity(name)
                            }}
                          >
                            +
                          </Button>
                          <Button
                            sx={{ backgroundColor: 'black', color: 'white'}}
                            onClick={() => {
                              removeItem(name)
                            }}
                          >
                            -
                          </Button>
                          <Button
                            sx={{ backgroundColor: 'black', color: 'white' }}
                            onClick={() => {
                              deleteItem(name)
                            }}
                          >
                            Delete
                          </Button>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        );
      case 1:

        const handleSelectItem = (item) => {
          setSelectedItems(prevItems => [...prevItems, item]);
        };

        return (
          <Box display="flex" justifyContent="space-between" >
            <Box 
              p={2} 
              sx={{ width: '40%' }}>
              <TableContainer component={Paper}
                style={{ 
                  height: 'calc(100vh - 100px)' }}
                >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Inventory Items</TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map(({ name }) => (
                      <TableRow key={name}>
                        <TableCell component="th" scope="row">
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            color="primary"
                            onChange={(event) => handleCheck(event, name)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                onClick={() => generateRecipe()}
                sx={{ backgroundColor: 'black', color: 'white', width: '100%', marginTop: '10px' }}
                
              >
                Generate Recipe
              </Button>
            </Box>
        
            {recipe && (
              <Box 
                mt={2} 
                p={2} 
                border={1} 
                borderColor="divider" 
                style={{ 
                  wordWrap: 'break-word', 
                  overflow: 'auto', 
                  height: 'calc(100vh - 100px)'
                }}
                sx={{ width: '60%' }}
              >
                <Typography variant="h6">Your Recipe:</Typography>
                <pre>{recipe}</pre>
              </Box>
            )}
          </Box>
        );
      case 2:
        return <div>Coming Soon</div>;
      default:
        return <div>Coming Soon</div>;
    }
  };

  return (
    <Box display="flex" height="100vh">
      <Box
        sx={{
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'right',
          justifyContent: 'right',
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        variant="persistent"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: drawerOpen ? '240px' : '0px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? '240px' : '0px',
            boxSizing: 'border-box',
          },
        }}
      >
        <Box
          sx={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'right',
            justifyContent: 'right',
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        </Box>
        {drawerOpen && (
          <Tabs
            value={value}
            onChange={handleChange}
            orientation="vertical"
            variant="fullWidth"
          >
            <Tab label="Inventory" />
            <Tab label="Create Recipe" />
            <Tab label="Scan Items" />
          </Tabs>
        )}
      </Drawer>
      <Box
        padding="16px 8px 0px 0px"
        width="100%"
        overflow="auto"
      >
        {renderTabContent()}
      </Box>
    </Box>
  );
}
