import { Box, Flex, Button, Text, Container } from "@chakra-ui/react";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { useColorModeValue } from "@chakra-ui/react"
import { useColorMode } from "@chakra-ui/react"

export default function Navbar() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Container maxW={"900px"}>
            <Box bg={useColorModeValue("linear-gradient(to right, #ad5389, #DECBA4)", "linear-gradient(to right, #355C7D, #6C5B7B, #C06C84)")} px={4} my={4} borderRadius={"5"}>
                <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
                    {/* LEFT SIDE */}
                    <Flex
                        justifyContent={"center"}
                        alignItems={"center"}
                        gap={3}
                        display={{ base: "none", sm: "flex" }}
                    >
                        <Text fontSize={"15"} fontStyle={"italic"}>LEARN</Text>
                        <img src='/react.png' alt='logo' width={50} height={50} />
                        <Text fontSize={"15"} fontStyle={"italic"}>AND</Text>
                        <img src='/golang.png' alt='logo' width={100} height={40} />
                    </Flex>

                    {/* RIGHT SIDE */}
                    <Flex alignItems={"center"} gap={3}>
                        <Text fontSize={"2xl"} fontWeight={1000}>
                            TODOLIST
                        </Text>
                        {/* Toggle Color Mode */}
                        <Button onClick={toggleColorMode}>
                            {colorMode === "light" ? <IoMoon /> : <LuSun size={20} />}
                        </Button>
                    </Flex>
                </Flex>
            </Box>
        </Container>
    );
}