import os
from distutils.command.build import build
from setuptools import find_packages, setup

try:
    with open(
        os.path.join(os.path.dirname(__file__), 'README.md'),
        encoding='utf-8'
    ) as f:
        long_description = f.read()
except Exception:
    long_description = ''


class CustomBuild(build):
    def run(self):
        super().run()


cmdclass = {
    'build': CustomBuild
}


setup(
    name='pretix-nbk-mpg',
    version='1.0.0',
    description='Pretix payment provider for NBK Mastercard Payment Gateway (MPGS) with Apple Pay support.',
    long_description=long_description,
    url='https://github.com/yadawi/pretix-nbk-mpg',
    author='Yadawi',
    author_email='admin@yadawi.com',
    license='Apache',
    install_requires=[],
    packages=find_packages(exclude=['tests', 'tests.*']),
    include_package_data=True,
    cmdclass=cmdclass,
    entry_points={
        'pretix.plugin': 'pretix_nbk_mpg = pretix_nbk_mpg:PretixPluginMeta',
    },
)
