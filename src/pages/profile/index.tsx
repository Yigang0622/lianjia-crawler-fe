import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import {useUser} from "@auth0/nextjs-auth0/client";


export const getServerSideProps = withPageAuthRequired();

export default function Home() {

    const { user, error, isLoading } = useUser()
    return <h1>Hello {user?.email}</h1>
}