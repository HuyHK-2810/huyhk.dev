import clsx from 'clsx';
import { SectionTitle } from './section-title';
import Container from '@/components/ui/container';


function RefinedAndScalable() {
    return (
        <header className={clsx('mb-8')}>
            <Container>

                <SectionTitle
                    title="Engineering Scalable and Reliable Applications."
                    caption="Skills & Abilities"
                    description="ReactJS, NextJS, NodeJS, .Net, Manual Testing, Playwright" />
            </Container>
        </header>
    );
}

export default RefinedAndScalable;
