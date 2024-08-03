'use client'
import { Box, Modal, Stack, TextField, Typography, Button, Tabs, Tab, Drawer, TableContainer, Table, TableHead, TableRow, Paper, TableCell, TableBody, ButtonGroup } from "@mui/material";
import { query, collection, getDocs, getDoc, setDoc, doc, deleteDoc } from "firebase/firestore";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import React from 'react';


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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

  const addItem = async (item) => {
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

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const renderTabContent = () => {
    switch (value) {
      case 0:

        const [searchTerm, setSearchTerm] = useState('');

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
                  <TextField
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => {
                      setItemName(e.target.value)
                    }}
                  >
                  </TextField>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      addItem(itemName)
                      setItemName('')
                      handleClose()
                    }}
                  >
                    Add
                  </Button>
                </Stack>
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
                              addItem(name)
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
        return <div>Create Recipe Content</div>;
      case 2:
        return <div>Scan Items Content</div>;
      default:
        return <div>Test</div>;
    }
  };

  return (
    <Box
      display="flex"
      height="100vh"
    >
      <Drawer
        variant="permanent"
        sx={{
          width: '240px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '240px',
            boxSizing: 'border-box',
          },
        }}
      >
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
      </Drawer>
      <Box
        p={3}
        width="100%"
        overflow="auto"
      >
        {renderTabContent()}
      </Box>
    </Box>
  );
}
