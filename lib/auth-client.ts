const { data, error } = await authClient.signUp.email({
    email: "test@example.com",
    password: "password1234",
    name: "test",
    image: "https://example.com/image.png",
});

const { data, error } = await authClient.signIn.email({
  email: "test@example.com",
  password: "password1234",
});

await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/login"); // redirect to login page
      },
    },
});